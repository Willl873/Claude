import UIKit

/// Deterministic, seeded RNG so a given photo always scores the same way.
/// (xorshift64*) — keeps results trustworthy and shareable.
struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64
    init(seed: UInt64) { state = seed == 0 ? 0x9E3779B97F4A7C15 : seed }
    mutating func next() -> UInt64 {
        state ^= state >> 12
        state ^= state << 25
        state ^= state >> 27
        return state &* 0x2545F4914F6CDD1D
    }
}

/// Turns objective `ImageFeatures` into a friendly, multi-dimension rating.
///
/// NOTE: This is an *entertainment* engine. It blends genuine perceptual
/// measurements (symmetry, tone evenness, exposure, warmth) with a generous,
/// good-natured grading curve. It is not a medical or diagnostic tool, and the
/// "Skin Tone" dimension rewards even, healthy-looking radiance — never one
/// complexion over another.
enum RatingEngine {

    /// Run the full pipeline for a photo of the given body part.
    static func rate(_ image: UIImage, bodyPart: BodyPart) -> Rating {
        let f = ImageAnalyzer.analyze(image)
        var rng = SeededGenerator(seed: f.seed)

        var scores: [DimensionScore] = []
        for dimension in bodyPart.dimensions {
            let base = feature(for: dimension, from: f)
            let jitter = Double.random(in: -0.35...0.35, using: &rng)
            let value = round1(clampScore(grade(base) + jitter))
            scores.append(DimensionScore(
                dimension: dimension,
                score: value,
                note: note(for: dimension, score: value, rng: &rng)
            ))
        }

        let overall = round1(weightedOverall(scores))
        let (title, blurb) = verdict(for: overall, rng: &rng)

        return Rating(
            bodyPart: bodyPart,
            overall: overall,
            dimensions: scores,
            imageFileName: "", // filled in by the store when the photo is saved
            verdictTitle: title,
            verdictBlurb: blurb
        )
    }

    // MARK: - Feature → dimension mapping

    private static func feature(for dim: RatingDimension, from f: ImageFeatures) -> Double {
        switch dim {
        case .proportions:
            // Symmetry dominates; a little structure (contrast) helps definition.
            return f.symmetry * 0.8 + f.contrast * 0.2
        case .skinQuality:
            // Even tone reads as smooth skin; a moderate amount of texture is ideal.
            let texture = 1 - abs(f.contrast - 0.45) / 0.55
            return f.toneEvenness * 0.7 + clamp01(texture) * 0.3
        case .skinTone:
            // Reward balanced warmth and a gentle, not over-saturated, glow.
            let warmthQuality = 1 - abs(f.warmth - 0.6) / 0.4
            let glow = 1 - abs(f.saturation - 0.35) / 0.65
            return clamp01(warmthQuality) * 0.6 + clamp01(glow) * 0.4
        case .health:
            // Good exposure and even tone read as vitality.
            let exposure = 1 - abs(f.brightness - 0.6) / 0.6
            return clamp01(exposure) * 0.55 + f.toneEvenness * 0.45
        }
    }

    /// Generous grading curve: maps a 0...1 feature onto a flattering score
    /// range so most photos land somewhere encouraging, with room at the top.
    private static func grade(_ x: Double, floor: Double = 4.6, ceil: Double = 9.7) -> Double {
        let t = clamp01(x)
        let eased = pow(t, 0.72) // lift the low end a touch
        return floor + (ceil - floor) * eased
    }

    private static func weightedOverall(_ scores: [DimensionScore]) -> Double {
        let totalWeight = scores.reduce(0) { $0 + $1.dimension.weight }
        guard totalWeight > 0 else { return 0 }
        let sum = scores.reduce(0) { $0 + $1.score * $1.dimension.weight }
        return sum / totalWeight
    }

    // MARK: - Copy

    private static func verdict(for overall: Double, rng: inout SeededGenerator) -> (String, String) {
        let tier: [(String, [String])]
        switch overall {
        case ..<4:
            tier = [("Diamond in the Rough", [
                "Everyone starts somewhere — there's real potential here.",
                "Lighting and a fresh angle could change everything.",
            ])]
        case ..<6:
            tier = [("Quietly Confident", [
                "Solid, dependable, nothing to hide here.",
                "A little pampering and these climb fast.",
            ])]
        case ..<7.5:
            tier = [("Genuinely Lovely", [
                "Well-balanced and easy on the eyes.",
                "These have main-character energy.",
            ])]
        case ..<9:
            tier = [("Absolutely Stunning", [
                "Frame-worthy. Seriously impressive.",
                "Top-shelf. The arches alone deserve applause.",
            ])]
        default:
            tier = [("Hall of Fame", [
                "Flawless. Museums would compete for these.",
                "Elite tier. We may need a bigger scale.",
            ])]
        }
        let (title, blurbs) = tier[0]
        return (title, pick(blurbs, &rng))
    }

    private static func note(for dim: RatingDimension, score: Double, rng: inout SeededGenerator) -> String {
        let high: [RatingDimension: [String]] = [
            .proportions: ["Beautifully balanced.", "Textbook symmetry.", "Sculptural, honestly."],
            .skinQuality: ["Silky smooth.", "Remarkably clear.", "Spa-day soft."],
            .skinTone: ["Even, healthy glow.", "Radiant and uniform.", "Gorgeous tone."],
            .health: ["Picture of vitality.", "Glowing with health.", "Thriving."],
        ]
        let mid: [RatingDimension: [String]] = [
            .proportions: ["Nicely shaped.", "Good balance overall."],
            .skinQuality: ["Smooth with character.", "In good condition."],
            .skinTone: ["Pleasant, even tone.", "Warm and natural."],
            .health: ["Looking healthy.", "Good vitality cues."],
        ]
        let low: [RatingDimension: [String]] = [
            .proportions: ["A new angle could flatter these.", "Room to find their best side."],
            .skinQuality: ["A little moisturiser goes a long way.", "Some TLC would shine here."],
            .skinTone: ["Better light would lift this.", "Tone could be more even."],
            .health: ["A bit of care recommended.", "Hydration would help."],
        ]
        let bucket = score >= 8 ? high : (score >= 6 ? mid : low)
        return pick(bucket[dim] ?? ["Looking good."], &rng)
    }

    // MARK: - Math helpers

    private static func pick(_ options: [String], _ rng: inout SeededGenerator) -> String {
        guard !options.isEmpty else { return "" }
        let idx = Int(rng.next() % UInt64(options.count))
        return options[idx]
    }

    private static func clamp01(_ x: Double) -> Double { min(max(x, 0), 1) }
    private static func clampScore(_ x: Double) -> Double { min(max(x, 0), 10) }
    private static func round1(_ x: Double) -> Double { (x * 10).rounded() / 10 }
}

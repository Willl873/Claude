import UIKit

/// Objective, on-device measurements pulled from a photo. These are the raw
/// inputs the `RatingEngine` turns into scores. Everything is normalised to a
/// 0...1 range so the engine can reason about it uniformly.
struct ImageFeatures {
    var brightness: Double      // average luminance
    var contrast: Double        // detail / sharpness proxy
    var saturation: Double      // colourfulness
    var toneEvenness: Double    // 1 = very even skin tone
    var symmetry: Double        // 1 = highly symmetric left/right
    var warmth: Double          // red vs blue balance (skin warmth)
    var seed: UInt64            // stable per-image value for deterministic flair

    static let neutral = ImageFeatures(
        brightness: 0.55, contrast: 0.5, saturation: 0.4,
        toneEvenness: 0.6, symmetry: 0.6, warmth: 0.6, seed: 0x9E3779B9
    )
}

/// Pure-Swift image analysis built on Core Graphics. No network, no servers —
/// the photo never leaves the device. We downsample to a small grid and compute
/// a handful of perceptual statistics that correlate with the qualities people
/// care about.
enum ImageAnalyzer {

    /// Edge length of the analysis grid. Small enough to be instant, large
    /// enough to capture meaningful structure.
    private static let dim = 48

    static func analyze(_ image: UIImage) -> ImageFeatures {
        guard let pixels = downsample(image) else { return .neutral }
        let count = dim * dim

        var lumas = [Double](repeating: 0, count: count)
        var sumR = 0.0, sumG = 0.0, sumB = 0.0
        var sumLuma = 0.0, sumSat = 0.0

        for i in 0..<count {
            let p = i * 4
            let r = Double(pixels[p]), g = Double(pixels[p + 1]), b = Double(pixels[p + 2])
            let luma = 0.299 * r + 0.587 * g + 0.114 * b
            lumas[i] = luma
            sumLuma += luma
            sumR += r; sumG += g; sumB += b
            let mx = max(r, g, b), mn = min(r, g, b)
            sumSat += mx > 0 ? (mx - mn) / mx : 0
        }

        let n = Double(count)
        let meanLuma = sumLuma / n

        // Standard deviation of luminance → contrast / detail.
        var variance = 0.0
        for l in lumas { let d = l - meanLuma; variance += d * d }
        let std = (variance / n).squareRoot()

        // Left/right symmetry from mirrored luminance differences.
        var symDiff = 0.0
        var symCount = 0.0
        for y in 0..<dim {
            for x in 0..<(dim / 2) {
                let a = lumas[y * dim + x]
                let b = lumas[y * dim + (dim - 1 - x)]
                symDiff += abs(a - b)
                symCount += 1
            }
        }
        let symMean = symCount > 0 ? symDiff / symCount : 0

        let brightness = clamp(meanLuma / 255)
        let contrast = clamp(std / 64)
        let saturation = clamp(sumSat / n)
        let toneEvenness = 1 - clamp(std / 96)
        let symmetry = 1 - clamp(symMean / 90)
        let warmth = clamp(sumR / max(sumR + sumB, 1))

        // Deterministic seed (FNV-1a over sampled bytes) so the same photo
        // always produces identical "flair" (jitter + copy choices).
        var hash: UInt64 = 0xcbf29ce484222325
        var i = 0
        while i < pixels.count {
            hash = (hash ^ UInt64(pixels[i])) &* 0x100000001b3
            i += 7
        }

        return ImageFeatures(
            brightness: brightness,
            contrast: contrast,
            saturation: saturation,
            toneEvenness: toneEvenness,
            symmetry: symmetry,
            warmth: warmth,
            seed: hash
        )
    }

    // MARK: - Helpers

    private static func downsample(_ image: UIImage) -> [UInt8]? {
        guard let cg = image.cgImage else { return nil }
        let bytesPerPixel = 4
        let bytesPerRow = dim * bytesPerPixel
        var data = [UInt8](repeating: 0, count: dim * dim * bytesPerPixel)
        let space = CGColorSpaceCreateDeviceRGB()
        let info = CGImageAlphaInfo.premultipliedLast.rawValue
        guard let ctx = CGContext(
            data: &data, width: dim, height: dim, bitsPerComponent: 8,
            bytesPerRow: bytesPerRow, space: space, bitmapInfo: info
        ) else { return nil }
        ctx.interpolationQuality = .high
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: dim, height: dim))
        return data
    }

    private static func clamp(_ x: Double) -> Double { min(max(x, 0), 1) }
}

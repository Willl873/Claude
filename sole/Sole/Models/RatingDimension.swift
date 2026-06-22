import SwiftUI

/// The individual qualities that make up an overall score.
enum RatingDimension: String, Codable, CaseIterable, Identifiable {
    case proportions
    case skinQuality
    case skinTone
    case health

    var id: String { rawValue }

    var title: String {
        switch self {
        case .proportions: return "Proportions"
        case .skinQuality: return "Skin Quality"
        case .skinTone: return "Skin Tone"
        case .health: return "Health"
        }
    }

    var symbol: String {
        switch self {
        case .proportions: return "ruler.fill"
        case .skinQuality: return "sparkles"
        case .skinTone: return "paintpalette.fill"
        case .health: return "heart.text.square.fill"
        }
    }

    /// One-line explanation shown under each bar.
    var blurb: String {
        switch self {
        case .proportions: return "Balance, symmetry & arch shape"
        case .skinQuality: return "Smoothness & overall condition"
        case .skinTone: return "Evenness & healthy radiance"
        case .health: return "Vitality cues & general wellness"
        }
    }

    /// How much each dimension contributes to the overall score (sums to 1).
    var weight: Double {
        switch self {
        case .proportions: return 0.30
        case .skinQuality: return 0.30
        case .skinTone: return 0.15
        case .health: return 0.25
        }
    }
}

import SwiftUI

/// A rateable body part.
///
/// The app is built so new body parts can be added later without touching the
/// rating flow — Feet is simply the first one that ships. Each case carries the
/// copy, iconography and the set of dimensions that make it tick.
enum BodyPart: String, Codable, CaseIterable, Identifiable {
    case feet

    var id: String { rawValue }

    /// `true` once the part is fully wired up and available in the UI.
    var isAvailable: Bool {
        switch self {
        case .feet: return true
        }
    }

    var name: String {
        switch self {
        case .feet: return "Feet"
        }
    }

    /// Used in headlines like "Rate my **feet**".
    var possessiveNoun: String {
        switch self {
        case .feet: return "feet"
        }
    }

    var symbol: String {
        switch self {
        case .feet: return "shoeprints.fill"
        }
    }

    var tagline: String {
        switch self {
        case .feet: return "Sole-searching, scientifically."
        }
    }

    /// The dimensions this part is scored on.
    var dimensions: [RatingDimension] {
        switch self {
        case .feet: return [.proportions, .skinQuality, .skinTone, .health]
        }
    }
}

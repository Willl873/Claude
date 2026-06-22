import SwiftUI

/// Central design system for Sole.
///
/// Everything visual flows through here so the app feels like one cohesive,
/// elegant object rather than a pile of screens. Colors are defined in code
/// (with one `AccentColor` asset for the system tint) so the palette is easy
/// to tune in a single place.
enum Theme {

    // MARK: Brand palette

    static let coral = Color(hex: 0xFF8A5B)
    static let rose = Color(hex: 0xFF5FA2)
    static let orchid = Color(hex: 0x9B5DE5)
    static let mint = Color(hex: 0x4ED7B0)

    /// The signature gradient used on hero elements and primary buttons.
    static let brandGradient = LinearGradient(
        colors: [coral, rose, orchid],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    /// A softer wash used behind content.
    static func backgroundGradient(_ scheme: ColorScheme) -> LinearGradient {
        switch scheme {
        case .dark:
            return LinearGradient(
                colors: [Color(hex: 0x140F1A), Color(hex: 0x0C0A12)],
                startPoint: .top, endPoint: .bottom
            )
        default:
            return LinearGradient(
                colors: [Color(hex: 0xFFF4F8), Color(hex: 0xF4F0FF)],
                startPoint: .top, endPoint: .bottom
            )
        }
    }

    // MARK: Score color

    /// Maps a 0...10 score to an encouraging traffic-light-ish color.
    static func color(forScore score: Double) -> Color {
        switch score {
        case ..<4: return Color(hex: 0xFF6B6B)
        case ..<6: return Color(hex: 0xFFA63D)
        case ..<7.5: return Color(hex: 0xFFC93C)
        case ..<9: return mint
        default: return Color(hex: 0x36D399)
        }
    }

    /// Gradient version of the score color, for rings and bars.
    static func gradient(forScore score: Double) -> LinearGradient {
        let c = color(forScore: score)
        return LinearGradient(
            colors: [c.opacity(0.7), c],
            startPoint: .leading, endPoint: .trailing
        )
    }

    // MARK: Typography

    static func display(_ size: CGFloat) -> Font {
        .system(size: size, weight: .heavy, design: .rounded)
    }

    static func rounded(_ size: CGFloat, _ weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }

    // MARK: Metrics

    static let corner: CGFloat = 28
    static let cardCorner: CGFloat = 22
}

extension Color {
    /// Hex initializer, e.g. `Color(hex: 0xFF5FA2)`.
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}

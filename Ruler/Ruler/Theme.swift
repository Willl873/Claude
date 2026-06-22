import SwiftUI

/// A curated set of colors for the ruler's light and dark themes.
///
/// The active theme is chosen from the resolved `ColorScheme` (which itself
/// honours the user's Auto / Light / Dark selection), so the look is a
/// deliberate, hand‑tuned palette rather than raw system colors.
struct Theme {
    let background: Color
    let tick: Color
    let label: Color
    let caption: Color
    let primaryMarker: Color
    let secondaryMarker: Color
    let isDark: Bool

    static let light = Theme(
        background:      Color(red: 0.980, green: 0.973, blue: 0.949), // warm paper
        tick:            Color(red: 0.125, green: 0.141, blue: 0.169), // slate
        label:           Color(red: 0.110, green: 0.125, blue: 0.150),
        caption:         Color(red: 0.110, green: 0.125, blue: 0.150).opacity(0.55),
        primaryMarker:   Color(red: 0.055, green: 0.549, blue: 0.420), // teal‑green
        secondaryMarker: Color(red: 0.910, green: 0.455, blue: 0.231), // burnt orange
        isDark: false
    )

    static let dark = Theme(
        background:      Color(red: 0.059, green: 0.067, blue: 0.082), // near‑black
        tick:            Color(red: 0.906, green: 0.914, blue: 0.925),
        label:           Color(red: 0.945, green: 0.949, blue: 0.957),
        caption:         Color(red: 0.945, green: 0.949, blue: 0.957).opacity(0.55),
        primaryMarker:   Color(red: 0.122, green: 0.839, blue: 0.627), // bright mint
        secondaryMarker: Color(red: 1.000, green: 0.635, blue: 0.302), // amber
        isDark: true
    )

    static func resolve(_ scheme: ColorScheme) -> Theme {
        scheme == .dark ? .dark : .light
    }
}

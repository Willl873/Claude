import SwiftUI

/// Frosted, rounded container used everywhere for that soft, premium feel.
struct GlassCard: ViewModifier {
    var padding: CGFloat = 18
    var corner: CGFloat = Theme.cardCorner

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: corner, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: corner, style: .continuous)
                    .stroke(.white.opacity(0.12), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.10), radius: 18, x: 0, y: 10)
    }
}

extension View {
    func glassCard(padding: CGFloat = 18, corner: CGFloat = Theme.cardCorner) -> some View {
        modifier(GlassCard(padding: padding, corner: corner))
    }
}

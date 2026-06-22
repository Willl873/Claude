import SwiftUI

/// The app's signature call-to-action: a gradient capsule with a satisfying
/// press animation and haptic feedback.
struct PrimaryButton: View {
    let title: String
    var systemImage: String? = nil
    var filled: Bool = true
    let action: () -> Void

    @State private var pressed = false

    var body: some View {
        Button {
            Haptics.bump()
            action()
        } label: {
            HStack(spacing: 10) {
                if let systemImage {
                    Image(systemName: systemImage)
                        .font(.system(size: 17, weight: .bold))
                }
                Text(title)
                    .font(Theme.rounded(18, .bold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 17)
            .foregroundStyle(filled ? .white : Theme.rose)
            .background {
                if filled {
                    Capsule().fill(Theme.brandGradient)
                } else {
                    Capsule().fill(.ultraThinMaterial)
                    Capsule().stroke(Theme.rose.opacity(0.5), lineWidth: 1.5)
                }
            }
            .shadow(color: filled ? Theme.rose.opacity(0.35) : .clear, radius: 14, x: 0, y: 8)
            .scaleEffect(pressed ? 0.96 : 1)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in withAnimation(.easeOut(duration: 0.12)) { pressed = true } }
                .onEnded { _ in withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) { pressed = false } }
        )
    }
}

import SwiftUI

/// Animatable number that counts up smoothly (SwiftUI won't tween Text on its
/// own, so we drive it through `animatableData`).
private struct CountingNumber: ViewModifier, Animatable {
    var number: Double
    var font: Font

    var animatableData: Double {
        get { number }
        set { number = newValue }
    }

    func body(content: Content) -> some View {
        Text(String(format: "%.1f", number))
            .font(font)
            .monospacedDigit()
    }
}

/// The hero circular score ring used on the results screen.
struct ScoreGauge: View {
    let score: Double          // 0...10
    var size: CGFloat = 230
    var lineWidth: CGFloat = 18
    var showCaption: Bool = true

    @State private var progress: Double = 0
    @State private var shownNumber: Double = 0

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.primary.opacity(0.08), lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress / 10)
                .stroke(
                    Theme.gradient(forScore: score),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .shadow(color: Theme.color(forScore: score).opacity(0.5), radius: 10)

            VStack(spacing: 2) {
                Color.clear
                    .frame(width: size * 0.6, height: size * 0.34)
                    .overlay(
                        Color.clear.modifier(
                            CountingNumber(number: shownNumber, font: Theme.display(size * 0.32))
                        )
                        .foregroundStyle(Theme.color(forScore: score))
                    )
                if showCaption {
                    Text("out of 10")
                        .font(Theme.rounded(13, .semibold))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(width: size, height: size)
        .onAppear {
            withAnimation(.spring(response: 1.1, dampingFraction: 0.75)) {
                progress = score
                shownNumber = score
            }
        }
    }
}

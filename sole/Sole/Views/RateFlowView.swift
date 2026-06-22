import SwiftUI

/// Orchestrates the three-step rating flow as a single full-screen experience:
/// **capture → analyzing → result**. Presented as a `fullScreenCover` so it
/// feels like a focused, immersive moment.
struct RateFlowView: View {
    let bodyPart: BodyPart

    @Environment(HistoryStore.self) private var history
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var scheme

    private enum Phase {
        case capture
        case analyzing(UIImage)
        case result(Rating, UIImage)
    }

    @State private var phase: Phase = .capture

    var body: some View {
        ZStack {
            Theme.backgroundGradient(scheme).ignoresSafeArea()

            content
                .transition(.asymmetric(
                    insertion: .move(edge: .trailing).combined(with: .opacity),
                    removal: .opacity
                ))
        }
    }

    @ViewBuilder
    private var content: some View {
        switch phase {
        case .capture:
            CaptureView(
                bodyPart: bodyPart,
                onImage: { image in
                    withAnimation(.easeInOut(duration: 0.35)) {
                        phase = .analyzing(image)
                    }
                },
                onClose: { dismiss() }
            )

        case .analyzing(let image):
            AnalyzingView(image: image, bodyPart: bodyPart) { rating in
                let stored = history.add(rating, image: image)
                withAnimation(.easeInOut(duration: 0.4)) {
                    phase = .result(stored, image)
                }
            }

        case .result(let rating, let image):
            ResultView(
                rating: rating,
                image: image,
                onRateAgain: {
                    withAnimation(.easeInOut(duration: 0.35)) {
                        phase = .capture
                    }
                },
                onDone: { dismiss() }
            )
        }
    }
}

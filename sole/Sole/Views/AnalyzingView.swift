import SwiftUI

/// Step 2 of the rating flow: the dramatic "AI is thinking" moment. We show the
/// photo behind an animated scanning beam and rotate through status lines while
/// the analysis runs on-device. A minimum duration keeps it feeling considered.
struct AnalyzingView: View {
    let image: UIImage
    let bodyPart: BodyPart
    var onComplete: (Rating) -> Void

    private let captions = [
        "Mapping arches…",
        "Measuring proportions…",
        "Reading skin tone…",
        "Assessing health cues…",
        "Consulting the AI…"
    ]

    @State private var captionIndex = 0
    @State private var beam = false
    @State private var pulse = false

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            ZStack {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 280, height: 360)
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

                // Scanning beam
                GeometryReader { geo in
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [.clear, Theme.mint.opacity(0.0), Theme.mint.opacity(0.9), .clear],
                                startPoint: .top, endPoint: .bottom
                            )
                        )
                        .frame(height: 80)
                        .offset(y: beam ? geo.size.height - 80 : 0)
                        .shadow(color: Theme.mint.opacity(0.8), radius: 12)
                }
                .frame(width: 280, height: 360)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
            }
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(Theme.brandGradient, lineWidth: 3)
            )
            .scaleEffect(pulse ? 1.02 : 0.98)
            .shadow(color: Theme.rose.opacity(0.3), radius: 24, y: 12)

            VStack(spacing: 6) {
                Text("Analysing your \(bodyPart.possessiveNoun)")
                    .font(Theme.display(22))

                Text(captions[captionIndex])
                    .font(Theme.rounded(15, .semibold))
                    .foregroundStyle(.secondary)
                    .contentTransition(.opacity)
                    .id(captionIndex)
                    .transition(.opacity)
            }

            Spacer()
        }
        .padding()
        .onAppear {
            withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                beam = true
            }
            withAnimation(.easeInOut(duration: 1.4).repeatForever(autoreverses: true)) {
                pulse = true
            }
        }
        .task {
            // Kick off the (fast) on-device analysis...
            async let computed = computeRating()

            // ...while we walk through the status lines for a considered feel.
            for index in captions.indices {
                withAnimation(.easeInOut(duration: 0.3)) { captionIndex = index }
                try? await Task.sleep(for: .milliseconds(560))
            }

            let rating = await computed
            Haptics.success()
            onComplete(rating)
        }
    }

    private func computeRating() async -> Rating {
        await Task.detached(priority: .userInitiated) {
            RatingEngine.rate(image, bodyPart: bodyPart)
        }.value
    }
}

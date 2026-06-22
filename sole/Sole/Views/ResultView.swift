import SwiftUI

/// Step 3 of the rating flow: the payoff. Animated score reveal, confetti for
/// great scores, a per-dimension breakdown, and a one-tap share card.
struct ResultView: View {
    let rating: Rating
    let image: UIImage
    var onRateAgain: () -> Void
    var onDone: () -> Void

    @State private var animateBars = false
    @State private var showShare = false
    @State private var renderedCard: UIImage?

    private var celebrate: Bool { rating.overall >= 8 }

    var body: some View {
        ZStack(alignment: .top) {
            ScrollView {
                VStack(spacing: 22) {
                    photoHeader

                    ScoreGauge(score: rating.overall)
                        .padding(.top, 4)

                    verdict

                    breakdown

                    disclaimer

                    actions
                }
                .padding(.horizontal, 22)
                .padding(.top, 64)
                .padding(.bottom, 36)
            }

            if celebrate {
                ConfettiView()
                    .allowsHitTesting(false)
                    .ignoresSafeArea()
            }

            topBar
        }
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.8).delay(0.5)) {
                animateBars = true
            }
        }
        .sheet(isPresented: $showShare) {
            if let renderedCard {
                ShareSheet(items: [renderedCard])
            }
        }
    }

    // MARK: Pieces

    private var topBar: some View {
        HStack {
            Spacer()
            Button {
                Haptics.tap()
                onDone()
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(.secondary)
                    .padding(11)
                    .background(.ultraThinMaterial, in: Circle())
            }
        }
        .padding(.horizontal, 22)
        .padding(.top, 16)
    }

    private var photoHeader: some View {
        Image(uiImage: image)
            .resizable()
            .scaledToFill()
            .frame(height: 170)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: Theme.corner, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.corner, style: .continuous)
                    .stroke(.white.opacity(0.15), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.18), radius: 16, y: 10)
    }

    private var verdict: some View {
        VStack(spacing: 6) {
            Text(rating.verdictTitle.uppercased())
                .font(Theme.rounded(13, .heavy))
                .tracking(1.5)
                .foregroundStyle(Theme.color(forScore: rating.overall))
            Text(rating.verdictBlurb)
                .font(Theme.rounded(17, .semibold))
                .multilineTextAlignment(.center)
                .foregroundStyle(.primary)
        }
        .frame(maxWidth: .infinity)
    }

    private var breakdown: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("The Breakdown")
                .font(Theme.display(20))
            ForEach(rating.dimensions) { item in
                DimensionBar(item: item, animate: animateBars)
            }
        }
        .glassCard(padding: 20)
    }

    private var disclaimer: some View {
        Text("Just for fun ✨ Sole is an entertainment app, not medical or cosmetic advice.")
            .font(Theme.rounded(11, .medium))
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 8)
    }

    private var actions: some View {
        VStack(spacing: 12) {
            PrimaryButton(title: "Share Result", systemImage: "square.and.arrow.up") {
                renderedCard = renderCard()
                showShare = true
            }
            PrimaryButton(title: "Rate Another", systemImage: "arrow.counterclockwise", filled: false) {
                onRateAgain()
            }
        }
    }

    // MARK: Share card rendering

    @MainActor
    private func renderCard() -> UIImage? {
        let card = ShareCard(rating: rating, image: image)
        let renderer = ImageRenderer(content: card)
        renderer.scale = UIScreen.main.scale
        return renderer.uiImage
    }
}

/// A self-contained, branded card rendered to an image for sharing. Kept
/// independent of the environment so `ImageRenderer` produces consistent output.
struct ShareCard: View {
    let rating: Rating
    let image: UIImage

    var body: some View {
        VStack(spacing: 18) {
            HStack(spacing: 8) {
                Image(systemName: "shoeprints.fill")
                    .foregroundStyle(Theme.brandGradient)
                Text("Sole")
                    .font(Theme.display(22))
                Spacer()
                Text(rating.date.formatted(date: .abbreviated, time: .omitted))
                    .font(Theme.rounded(13, .semibold))
                    .foregroundStyle(.secondary)
            }

            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(width: 320, height: 220)
                .clipped()
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(rating.overallText)
                    .font(Theme.display(64))
                    .foregroundStyle(Theme.color(forScore: rating.overall))
                Text("/ 10")
                    .font(Theme.display(24))
                    .foregroundStyle(.secondary)
            }

            Text(rating.verdictTitle.uppercased())
                .font(Theme.rounded(15, .heavy))
                .tracking(2)
                .foregroundStyle(Theme.color(forScore: rating.overall))

            VStack(spacing: 10) {
                ForEach(rating.dimensions) { item in
                    HStack {
                        Text(item.dimension.title)
                            .font(Theme.rounded(14, .semibold))
                        Spacer()
                        Text(String(format: "%.1f", item.score))
                            .font(Theme.rounded(14, .heavy))
                            .foregroundStyle(Theme.color(forScore: item.score))
                    }
                }
            }

            Text("Rated with Sole")
                .font(Theme.rounded(12, .bold))
                .foregroundStyle(.secondary)
        }
        .padding(26)
        .frame(width: 380)
        .background(Color(hex: 0x16121C))
        .foregroundStyle(.white)
    }
}

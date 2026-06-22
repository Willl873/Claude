import SwiftUI

/// First-run welcome. Three quick, friendly slides that set expectations and
/// get out of the way fast.
struct OnboardingView: View {
    var onFinish: () -> Void

    @State private var page = 0

    private struct Slide: Identifiable {
        let id = UUID()
        let icon: String
        let title: String
        let subtitle: String
    }

    private let slides = [
        Slide(icon: "shoeprints.fill",
              title: "Meet Sole",
              subtitle: "Get an honest, good-natured score for your feet — out of 10."),
        Slide(icon: "wand.and.stars",
              title: "AI-Powered Scoring",
              subtitle: "We read proportions, skin quality, tone and health, all privately on your device."),
        Slide(icon: "flame.fill",
              title: "Build Your Streak",
              subtitle: "Track your best scores and come back daily to watch them climb.")
    ]

    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $page) {
                ForEach(Array(slides.enumerated()), id: \.element.id) { index, slide in
                    slideView(slide)
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: page)

            // Page dots
            HStack(spacing: 8) {
                ForEach(slides.indices, id: \.self) { i in
                    Capsule()
                        .fill(i == page ? Theme.rose : Color.secondary.opacity(0.3))
                        .frame(width: i == page ? 22 : 8, height: 8)
                        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: page)
                }
            }
            .padding(.bottom, 24)

            VStack(spacing: 12) {
                PrimaryButton(title: page == slides.count - 1 ? "Get Started" : "Continue") {
                    if page == slides.count - 1 {
                        onFinish()
                    } else {
                        withAnimation { page += 1 }
                    }
                }
                Button("Skip") {
                    Haptics.tap()
                    onFinish()
                }
                .font(Theme.rounded(15, .semibold))
                .foregroundStyle(.secondary)
                .opacity(page == slides.count - 1 ? 0 : 1)
            }
            .padding(.horizontal, 28)
            .padding(.bottom, 28)
        }
    }

    private func slideView(_ slide: Slide) -> some View {
        VStack(spacing: 26) {
            Spacer()
            ZStack {
                Circle()
                    .fill(Theme.brandGradient)
                    .frame(width: 170, height: 170)
                    .blur(radius: 40)
                    .opacity(0.6)
                Image(systemName: slide.icon)
                    .font(.system(size: 88, weight: .regular))
                    .foregroundStyle(Theme.brandGradient)
            }
            VStack(spacing: 12) {
                Text(slide.title)
                    .font(Theme.display(30))
                    .multilineTextAlignment(.center)
                Text(slide.subtitle)
                    .font(Theme.rounded(17, .medium))
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 36)
            }
            Spacer()
        }
    }
}

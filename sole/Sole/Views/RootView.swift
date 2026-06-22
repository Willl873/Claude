import SwiftUI

/// Top-level router: shows onboarding on first launch, otherwise the main app.
struct RootView: View {
    @AppStorage("hasOnboarded") private var hasOnboarded = false
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        ZStack {
            Theme.backgroundGradient(scheme).ignoresSafeArea()

            if hasOnboarded {
                MainView()
                    .transition(.opacity)
            } else {
                OnboardingView {
                    withAnimation(.easeInOut) { hasOnboarded = true }
                }
                .transition(.opacity)
            }
        }
    }
}

/// The signed-in experience: a two-tab shell with the rating flow presented
/// over the top.
struct MainView: View {
    @State private var showRateFlow = false
    @Environment(\.colorScheme) private var scheme

    private let bodyPart: BodyPart = .feet

    var body: some View {
        TabView {
            NavigationStack {
                HomeView(onRate: { showRateFlow = true })
                    .background(Theme.backgroundGradient(scheme).ignoresSafeArea())
            }
            .tabItem { Label("Rate", systemImage: "wand.and.stars") }

            NavigationStack {
                HistoryView()
                    .background(Theme.backgroundGradient(scheme).ignoresSafeArea())
            }
            .tabItem { Label("History", systemImage: "clock.arrow.circlepath") }
        }
        .tint(Theme.rose)
        .fullScreenCover(isPresented: $showRateFlow) {
            RateFlowView(bodyPart: bodyPart)
        }
    }
}

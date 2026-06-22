import SwiftUI

/// App entry point. Owns the single `HistoryStore` and injects it into the
/// environment so every screen shares the same source of truth.
@main
struct SoleApp: App {
    @State private var history = HistoryStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(history)
                .tint(Theme.rose)
        }
    }
}

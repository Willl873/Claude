import SwiftUI

/// Full history of past ratings with swipe-to-delete and a tap-through to the
/// detail view.
struct HistoryView: View {
    @Environment(HistoryStore.self) private var history
    @State private var showClearConfirm = false

    var body: some View {
        Group {
            if history.ratings.isEmpty {
                emptyState
            } else {
                List {
                    ForEach(history.ratings) { rating in
                        ZStack {
                            NavigationLink(value: rating) { EmptyView() }.opacity(0)
                            HistoryRow(rating: rating, image: history.image(for: rating))
                        }
                        .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                        .listRowBackground(Color.clear)
                        .listRowSeparator(.hidden)
                    }
                    .onDelete(perform: delete)
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
        }
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(for: Rating.self) { rating in
            RatingDetailView(rating: rating)
        }
        .toolbar {
            if !history.ratings.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(role: .destructive) {
                        showClearConfirm = true
                    } label: {
                        Image(systemName: "trash")
                    }
                    .tint(Theme.rose)
                }
            }
        }
        .confirmationDialog("Clear all ratings?", isPresented: $showClearConfirm, titleVisibility: .visible) {
            Button("Delete Everything", role: .destructive) {
                Haptics.warning()
                withAnimation { history.clearAll() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This permanently removes every saved rating and photo.")
        }
    }

    private func delete(at offsets: IndexSet) {
        Haptics.tap()
        let toDelete = offsets.map { history.ratings[$0] }
        withAnimation {
            toDelete.forEach { history.delete($0) }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 44))
                .foregroundStyle(Theme.brandGradient)
            Text("Nothing here yet")
                .font(Theme.display(22))
            Text("Your rated feet will show up here so you can track your glow-up over time.")
                .font(Theme.rounded(15, .medium))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .navigationTitle("History")
    }
}

private struct HistoryRow: View {
    let rating: Rating
    let image: UIImage?

    var body: some View {
        HStack(spacing: 14) {
            Group {
                if let image {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                } else {
                    Rectangle().fill(.ultraThinMaterial)
                        .overlay(Image(systemName: "shoeprints.fill").foregroundStyle(.secondary))
                }
            }
            .frame(width: 64, height: 64)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

            VStack(alignment: .leading, spacing: 3) {
                Text(rating.verdictTitle)
                    .font(Theme.rounded(16, .bold))
                Text(rating.date.formatted(date: .abbreviated, time: .shortened))
                    .font(Theme.rounded(13, .medium))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(rating.overallText)
                .font(Theme.display(24))
                .monospacedDigit()
                .foregroundStyle(Theme.color(forScore: rating.overall))
        }
        .padding(12)
        .glassCard(padding: 0)
    }
}

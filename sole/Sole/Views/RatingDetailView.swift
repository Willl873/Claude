import SwiftUI

/// Read-only detail for a previously saved rating, reachable from Home and
/// History. Mirrors the results screen without the flow controls.
struct RatingDetailView: View {
    let rating: Rating

    @Environment(HistoryStore.self) private var history
    @Environment(\.dismiss) private var dismiss

    @State private var animateBars = false
    @State private var showShare = false
    @State private var renderedCard: UIImage?
    @State private var showDeleteConfirm = false

    private var image: UIImage? { history.image(for: rating) }

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                if let image {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 200)
                        .frame(maxWidth: .infinity)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.corner, style: .continuous))
                        .shadow(color: .black.opacity(0.15), radius: 14, y: 8)
                }

                ScoreGauge(score: rating.overall, size: 200)

                VStack(spacing: 6) {
                    Text(rating.verdictTitle.uppercased())
                        .font(Theme.rounded(13, .heavy))
                        .tracking(1.5)
                        .foregroundStyle(Theme.color(forScore: rating.overall))
                    Text(rating.verdictBlurb)
                        .font(Theme.rounded(17, .semibold))
                        .multilineTextAlignment(.center)
                }

                VStack(alignment: .leading, spacing: 20) {
                    Text("The Breakdown")
                        .font(Theme.display(20))
                    ForEach(rating.dimensions) { item in
                        DimensionBar(item: item, animate: animateBars)
                    }
                }
                .glassCard(padding: 20)

                PrimaryButton(title: "Share Result", systemImage: "square.and.arrow.up") {
                    renderedCard = renderCard()
                    showShare = true
                }
            }
            .padding(.horizontal, 22)
            .padding(.vertical, 16)
        }
        .navigationTitle(rating.date.formatted(date: .abbreviated, time: .omitted))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(role: .destructive) {
                    showDeleteConfirm = true
                } label: {
                    Image(systemName: "trash")
                }
                .tint(Theme.rose)
            }
        }
        .confirmationDialog("Delete this rating?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Delete", role: .destructive) {
                Haptics.warning()
                history.delete(rating)
                dismiss()
            }
            Button("Cancel", role: .cancel) {}
        }
        .sheet(isPresented: $showShare) {
            if let renderedCard {
                ShareSheet(items: [renderedCard])
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.8).delay(0.2)) {
                animateBars = true
            }
        }
    }

    @MainActor
    private func renderCard() -> UIImage? {
        guard let image else { return nil }
        let renderer = ImageRenderer(content: ShareCard(rating: rating, image: image))
        renderer.scale = UIScreen.main.scale
        return renderer.uiImage
    }
}

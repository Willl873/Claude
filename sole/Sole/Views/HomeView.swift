import SwiftUI

/// The home screen: a warm greeting, the headline call-to-action, retention
/// stats (streak / best / average) and a peek at recent ratings.
struct HomeView: View {
    var onRate: () -> Void

    @Environment(HistoryStore.self) private var history

    private let bodyPart: BodyPart = .feet

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                greeting

                heroCard

                statsRow

                recentSection
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 30)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                HStack(spacing: 6) {
                    Image(systemName: "shoeprints.fill")
                        .foregroundStyle(Theme.brandGradient)
                    Text("Sole")
                        .font(Theme.display(20))
                }
            }
        }
    }

    // MARK: Greeting

    private var greeting: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(timeGreeting)
                .font(Theme.rounded(15, .semibold))
                .foregroundStyle(.secondary)
            Text("Ready to be rated?")
                .font(Theme.display(28))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var timeGreeting: String {
        switch Calendar.current.component(.hour, from: Date()) {
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        case 17..<22: return "Good evening"
        default: return "Burning the midnight oil"
        }
    }

    // MARK: Hero CTA

    private var heroCard: some View {
        Button {
            onRate()
        } label: {
            VStack(alignment: .leading, spacing: 16) {
                Image(systemName: bodyPart.symbol)
                    .font(.system(size: 40, weight: .semibold))
                VStack(alignment: .leading, spacing: 4) {
                    Text("Rate my \(bodyPart.possessiveNoun)")
                        .font(Theme.display(26))
                    Text(bodyPart.tagline)
                        .font(Theme.rounded(14, .medium))
                        .opacity(0.9)
                }
                HStack(spacing: 8) {
                    Text("Start")
                        .font(Theme.rounded(16, .bold))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 15, weight: .bold))
                }
                .padding(.vertical, 11)
                .padding(.horizontal, 22)
                .background(.white.opacity(0.22), in: Capsule())
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(24)
            .background(Theme.brandGradient, in: RoundedRectangle(cornerRadius: Theme.corner, style: .continuous))
            .shadow(color: Theme.rose.opacity(0.4), radius: 20, y: 12)
        }
        .buttonStyle(.plain)
    }

    // MARK: Stats

    private var statsRow: some View {
        HStack(spacing: 12) {
            StatChip(value: "\(history.streak)", label: "Day Streak", icon: "flame.fill", tint: Theme.coral)
            StatChip(
                value: history.best.map { $0.overallText } ?? "—",
                label: "Best Score", icon: "trophy.fill", tint: Color(hex: 0xFFC93C)
            )
            StatChip(
                value: history.count > 0 ? String(format: "%.1f", history.average) : "—",
                label: "Average", icon: "chart.bar.fill", tint: Theme.orchid
            )
        }
    }

    // MARK: Recent

    @ViewBuilder
    private var recentSection: some View {
        HStack {
            Text("Recent")
                .font(Theme.display(20))
            Spacer()
            if !history.ratings.isEmpty {
                NavigationLink {
                    HistoryView()
                } label: {
                    Text("See all")
                        .font(Theme.rounded(14, .semibold))
                        .foregroundStyle(Theme.rose)
                }
            }
        }

        if history.ratings.isEmpty {
            emptyState
        } else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    ForEach(history.ratings.prefix(8)) { rating in
                        NavigationLink {
                            RatingDetailView(rating: rating)
                        } label: {
                            RecentCard(rating: rating, image: history.image(for: rating))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "sparkles")
                .font(.system(size: 30))
                .foregroundStyle(Theme.rose)
            Text("No ratings yet")
                .font(Theme.rounded(17, .bold))
            Text("Tap “Rate my feet” to get your first score.")
                .font(Theme.rounded(14, .medium))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 30)
        .glassCard()
    }
}

// MARK: - Small home components

private struct StatChip: View {
    let value: String
    let label: String
    let icon: String
    let tint: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 17, weight: .bold))
                .foregroundStyle(tint)
            Text(value)
                .font(Theme.display(22))
                .monospacedDigit()
            Text(label)
                .font(Theme.rounded(11, .semibold))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .glassCard(padding: 4)
    }
}

private struct RecentCard: View {
    let rating: Rating
    let image: UIImage?

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topTrailing) {
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
                .frame(width: 140, height: 140)
                .clipped()

                Text(rating.overallText)
                    .font(Theme.rounded(15, .heavy))
                    .monospacedDigit()
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Theme.color(forScore: rating.overall).opacity(0.95), in: Capsule())
                    .padding(8)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(rating.verdictTitle)
                    .font(Theme.rounded(13, .bold))
                    .lineLimit(1)
                Text(rating.date.formatted(date: .abbreviated, time: .omitted))
                    .font(Theme.rounded(11, .medium))
                    .foregroundStyle(.secondary)
            }
            .padding(10)
            .frame(width: 140, alignment: .leading)
        }
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(.white.opacity(0.12), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

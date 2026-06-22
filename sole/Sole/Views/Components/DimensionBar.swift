import SwiftUI

/// A single labelled, animated breakdown row on the results screen.
struct DimensionBar: View {
    let item: DimensionScore
    var animate: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                Image(systemName: item.dimension.symbol)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(Theme.color(forScore: item.score))
                    .frame(width: 22)

                Text(item.dimension.title)
                    .font(Theme.rounded(16, .bold))

                Spacer()

                Text(String(format: "%.1f", item.score))
                    .font(Theme.rounded(16, .heavy))
                    .monospacedDigit()
                    .foregroundStyle(Theme.color(forScore: item.score))
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.primary.opacity(0.08))
                    Capsule()
                        .fill(Theme.gradient(forScore: item.score))
                        .frame(width: animate ? geo.size.width * (item.score / 10) : 0)
                }
            }
            .frame(height: 10)

            Text("\(item.note) · \(item.dimension.blurb)")
                .font(Theme.rounded(12, .medium))
                .foregroundStyle(.secondary)
        }
    }
}

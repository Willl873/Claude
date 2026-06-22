import SwiftUI

/// Manual calibration by matching a real, standard‑sized card against the screen.
///
/// Every credit / debit / ID card follows the ISO/IEC 7810 **ID‑1** standard:
/// 85.60 mm × 53.98 mm. The card is shown *lengthwise* (portrait) because its
/// long edge (3.37 in) fits comfortably along an iPhone's height, whereas its
/// long edge is wider than the phone is across.
///
/// The user resizes the outline until it matches their card; from the matched
/// length in points we derive an exact points‑per‑inch value:
///
///     pointsPerInch = cardLengthPoints / 3.3701
struct CalibrationView: View {
    let theme: Theme

    @AppStorage(DeviceCalibration.manualCalibrationKey) private var manualPPI: Double = 0
    @Environment(\.dismiss) private var dismiss

    /// ISO/IEC 7810 ID‑1 long edge (85.60 mm) in inches.
    static let cardLengthInches = 85.60 / 25.4   // 3.3701
    /// Ratio of the short edge to the long edge (53.98 / 85.60).
    static let cardAspect = 53.98 / 85.60        // 0.6307

    /// The card's on‑screen length (its long edge), in logical points.
    @State private var cardLengthPoints: Double = 0

    private var computedPPI: Double { cardLengthPoints / Self.cardLengthInches }
    private var cardWidthPoints: Double { cardLengthPoints * Self.cardAspect }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Place a credit, debit, or ID card lengthwise against the screen and resize the outline until it matches the card exactly.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                cardOutline

                readout

                slider

                Spacer(minLength: 0)
            }
            .padding(.top, 12)
            .padding(.bottom, 20)
            .frame(maxWidth: .infinity)
            .background(theme.background.ignoresSafeArea())
            .navigationTitle("Calibrate")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        manualPPI = computedPPI
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
            .onAppear {
                // Seed the outline from whatever calibration is active now.
                cardLengthPoints = DeviceCalibration.pointsPerInch * Self.cardLengthInches
            }
        }
    }

    private var cardOutline: some View {
        RoundedRectangle(cornerRadius: cardWidthPoints * 0.06, style: .continuous)
            .strokeBorder(theme.primaryMarker, lineWidth: 3)
            .background(
                RoundedRectangle(cornerRadius: cardWidthPoints * 0.06, style: .continuous)
                    .fill(theme.primaryMarker.opacity(0.08))
            )
            .frame(width: cardWidthPoints, height: cardLengthPoints)
            .overlay(
                Image(systemName: "creditcard")
                    .font(.system(size: 34, weight: .regular))
                    .foregroundStyle(theme.primaryMarker.opacity(0.5))
            )
            .frame(maxWidth: .infinity)
            .animation(.interactiveSpring(), value: cardLengthPoints)
    }

    private var readout: some View {
        VStack(spacing: 4) {
            Text(String(format: "%.0f points per inch", computedPPI))
                .font(.system(.headline, design: .rounded))
                .foregroundStyle(theme.label)
            Text(String(format: "%.1f points per cm", computedPPI / 2.54))
                .font(.system(.subheadline, design: .rounded))
                .foregroundStyle(.secondary)
            if manualPPI > 0 {
                Button("Reset to automatic") {
                    manualPPI = 0
                    dismiss()
                }
                .font(.footnote)
                .padding(.top, 4)
            }
        }
    }

    private var slider: some View {
        VStack(spacing: 8) {
            HStack {
                Button { adjust(-1) } label: { Image(systemName: "minus.circle.fill") }
                Slider(value: $cardLengthPoints, in: 400...620)
                    .tint(theme.primaryMarker)
                Button { adjust(1) } label: { Image(systemName: "plus.circle.fill") }
            }
            .font(.title3)
            .foregroundStyle(theme.primaryMarker)
            Text("Fine‑tune with the + / − buttons")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 24)
    }

    private func adjust(_ delta: Double) {
        cardLengthPoints = min(620, max(400, cardLengthPoints + delta))
    }
}

#Preview {
    CalibrationView(theme: .light)
}

import SwiftUI

struct ContentView: View {
    static let rulerSpace = "rulerSpace"

    @AppStorage("unit") private var unit: MeasurementUnit = .centimeters
    @AppStorage("markerMode") private var markerMode: MarkerMode = .single
    @AppStorage("appearance") private var appearance: AppearanceMode = .system

    // Marker positions, in logical points from the top of the usable area.
    @State private var markerA: CGFloat = 120
    @State private var markerB: CGFloat = 320

    var body: some View {
        GeometryReader { geo in
            let height = geo.size.height

            ZStack(alignment: .topLeading) {
                Color(.systemBackground).ignoresSafeArea()

                RulerView(unit: unit)
                    .allowsHitTesting(false)

                // Markers
                MarkerLine(position: $markerA,
                           limit: height,
                           label: readout(for: markerA),
                           tint: .accentColor,
                           coordinateSpace: Self.rulerSpace)

                if markerMode == .double {
                    MarkerLine(position: $markerB,
                               limit: height,
                               label: readout(for: markerB),
                               tint: .orange,
                               coordinateSpace: Self.rulerSpace)

                    distanceBadge(height: height)
                }

                VStack {
                    Spacer()
                    controls
                }
            }
            .coordinateSpace(name: Self.rulerSpace)
            .onAppear { clampMarkers(to: height) }
            .onChange(of: height) { _, newValue in clampMarkers(to: newValue) }
        }
        .preferredColorScheme(appearance.colorScheme)
    }

    // MARK: - Controls

    private var controls: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Picker("Unit", selection: $unit) {
                    ForEach(MeasurementUnit.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.segmented)

                Picker("Markers", selection: $markerMode) {
                    ForEach(MarkerMode.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.segmented)
            }

            HStack {
                Picker("Appearance", selection: $appearance) {
                    ForEach(AppearanceMode.allCases) { mode in
                        Label(mode.label, systemImage: mode.symbol).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
            }

            if DeviceCalibration.isEstimated {
                Text("Calibration estimated for this device")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
    }

    private func distanceBadge(height: CGFloat) -> some View {
        let span = abs(markerB - markerA)
        let value = Double(span) / unit.pointsPerUnit
        let midY = (markerA + markerB) / 2
        return Text("Δ " + unit.string(for: value))
            .font(.system(.subheadline, design: .rounded).weight(.bold))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Capsule().fill(.ultraThinMaterial))
            .overlay(Capsule().stroke(Color.primary.opacity(0.15)))
            .position(x: max(120, UIScreen.main.bounds.width * 0.5), y: midY)
            .allowsHitTesting(false)
    }

    // MARK: - Helpers

    private func readout(for position: CGFloat) -> String {
        unit.string(for: Double(position) / unit.pointsPerUnit)
    }

    private func clampMarkers(to height: CGFloat) {
        guard height > 0 else { return }
        markerA = min(max(0, markerA), height)
        markerB = min(max(0, markerB), height)
    }
}

/// A draggable horizontal measuring line with a live readout pill.
private struct MarkerLine: View {
    @Binding var position: CGFloat
    let limit: CGFloat
    let label: String
    let tint: Color
    let coordinateSpace: String

    @GestureState private var dragging = false

    var body: some View {
        ZStack(alignment: .topLeading) {
            Rectangle()
                .fill(tint)
                .frame(height: 2)
                .frame(maxWidth: .infinity)
                .shadow(color: tint.opacity(0.4), radius: dragging ? 4 : 0)

            HStack(spacing: 6) {
                Image(systemName: "arrow.up.and.down")
                    .font(.caption2.weight(.bold))
                Text(label)
                    .font(.system(.footnote, design: .rounded).weight(.semibold))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Capsule().fill(tint))
            .padding(.trailing, 16)
            .frame(maxWidth: .infinity, alignment: .trailing)
            .offset(y: -14)
        }
        .frame(maxWidth: .infinity)
        .offset(y: position)
        .contentShape(Rectangle().inset(by: -22))
        .gesture(
            DragGesture(coordinateSpace: .named(coordinateSpace))
                .updating($dragging) { _, state, _ in state = true }
                .onChanged { value in
                    position = min(max(0, value.location.y), limit)
                }
        )
        .animation(.interactiveSpring(), value: dragging)
    }
}

#Preview {
    ContentView()
}

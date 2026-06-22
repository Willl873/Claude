import SwiftUI

struct ContentView: View {
    static let rulerSpace = "rulerSpace"

    @AppStorage("unit") private var unit: MeasurementUnit = .centimeters
    @AppStorage("markerMode") private var markerMode: MarkerMode = .single
    @AppStorage("appearance") private var appearance: AppearanceMode = .system
    // Observed so the ruler redraws the moment a manual calibration is saved.
    @AppStorage(DeviceCalibration.manualCalibrationKey) private var manualPPI: Double = 0

    @Environment(\.colorScheme) private var environmentScheme

    // Marker positions, in logical points from the top of the usable area.
    @State private var markerA: CGFloat = 120
    @State private var markerB: CGFloat = 320
    @State private var isLocked = false
    @State private var showCalibration = false

    private var theme: Theme {
        Theme.resolve(appearance.colorScheme ?? environmentScheme)
    }

    var body: some View {
        GeometryReader { geo in
            let height = geo.size.height
            let width = geo.size.width

            ZStack(alignment: .topLeading) {
                theme.background.ignoresSafeArea()

                RulerView(unit: unit, theme: theme)
                    .allowsHitTesting(false)

                // Markers
                MarkerLine(position: $markerA,
                           limit: height,
                           label: readout(for: markerA),
                           tint: theme.primaryMarker,
                           locked: isLocked,
                           coordinateSpace: Self.rulerSpace)

                if markerMode == .double {
                    MarkerLine(position: $markerB,
                               limit: height,
                               label: readout(for: markerB),
                               tint: theme.secondaryMarker,
                               locked: isLocked,
                               coordinateSpace: Self.rulerSpace)

                    distanceBadge(width: width)
                }

                toolbar

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
        .sheet(isPresented: $showCalibration) {
            CalibrationView(theme: theme)
        }
    }

    // MARK: - Top toolbar (lock + calibrate)

    private var toolbar: some View {
        HStack {
            Spacer()
            HStack(spacing: 10) {
                toolbarButton(systemName: isLocked ? "lock.fill" : "lock.open",
                              active: isLocked) {
                    isLocked.toggle()
                }
                toolbarButton(systemName: "ruler", active: DeviceCalibration.isManuallyCalibrated) {
                    showCalibration = true
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }

    private func toolbarButton(systemName: String, active: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(active ? Color.white : theme.label)
                .frame(width: 42, height: 42)
                .background(
                    Circle().fill(active ? theme.primaryMarker : Color.clear)
                )
                .background(.ultraThinMaterial, in: Circle())
                .overlay(Circle().stroke(theme.tick.opacity(0.12)))
        }
    }

    // MARK: - Bottom controls

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

            Picker("Appearance", selection: $appearance) {
                ForEach(AppearanceMode.allCases) { mode in
                    Label(mode.label, systemImage: mode.symbol).tag(mode)
                }
            }
            .pickerStyle(.segmented)

            if DeviceCalibration.isManuallyCalibrated {
                Text("Manually calibrated")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            } else if DeviceCalibration.isEstimated {
                Text("Calibration estimated — tap the ruler icon to set it by hand")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
        .frame(maxWidth: 520)
        .frame(maxWidth: .infinity)
    }

    private func distanceBadge(width: CGFloat) -> some View {
        let span = abs(markerB - markerA)
        let value = Double(span) / unit.pointsPerUnit
        let midY = (markerA + markerB) / 2
        return Text("Δ " + unit.string(for: value))
            .font(.system(.subheadline, design: .rounded).weight(.bold))
            .foregroundStyle(theme.label)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Capsule().fill(.ultraThinMaterial))
            .overlay(Capsule().stroke(theme.tick.opacity(0.15)))
            .position(x: max(120, width * 0.5), y: midY)
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
    let locked: Bool
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
                Image(systemName: locked ? "lock.fill" : "arrow.up.and.down")
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
        .allowsHitTesting(!locked)
        .animation(.interactiveSpring(), value: dragging)
    }
}

#Preview {
    ContentView()
}

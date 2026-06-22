import SwiftUI

/// Draws the calibrated ruler scale down the leading edge of the available area.
///
/// `y = 0` corresponds to the top of the usable (safe‑area) rectangle, which is
/// the ruler's zero point. Every tick is positioned using `pointsPerUnit`, so the
/// spacing is physically accurate on the glass.
struct RulerView: View {
    let unit: MeasurementUnit

    var body: some View {
        Canvas { context, size in
            draw(in: context, size: size)
        }
    }

    private func draw(in context: GraphicsContext, size: CGSize) {
        let pointsPerUnit = unit.pointsPerUnit
        let subdivisions = unit.subdivisions
        let step = pointsPerUnit / Double(subdivisions)
        guard step > 0.5 else { return } // guard against degenerate calibration

        let tickColor = Color.primary
        let baselineX: CGFloat = 0

        // Tick lengths grow with significance.
        let minorLen: CGFloat = 14
        let midLen: CGFloat = 24
        let majorLen: CGFloat = 42

        // Leading baseline the ticks hang from.
        var baseline = Path()
        baseline.move(to: CGPoint(x: baselineX, y: 0))
        baseline.addLine(to: CGPoint(x: baselineX, y: size.height))
        context.stroke(baseline, with: .color(tickColor), lineWidth: 1.5)

        var index = 0
        var y = 0.0
        while y <= Double(size.height) {
            let isMajor = index % subdivisions == 0
            let isMid = !isMajor && isHalfTick(index: index, subdivisions: subdivisions)
            let length = isMajor ? majorLen : (isMid ? midLen : minorLen)
            let width: CGFloat = isMajor ? 1.5 : (isMid ? 1.2 : 0.8)

            var tick = Path()
            tick.move(to: CGPoint(x: baselineX, y: y))
            tick.addLine(to: CGPoint(x: baselineX + length, y: y))
            context.stroke(tick, with: .color(tickColor), lineWidth: width)

            if isMajor && index > 0 {
                let whole = index / subdivisions
                let text = Text("\(whole)")
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundColor(tickColor)
                context.draw(text, at: CGPoint(x: baselineX + majorLen + 12, y: y), anchor: .leading)
            }

            index += 1
            y = Double(index) * step
        }

        // Unit caption near the origin.
        let caption = Text(unit.label.uppercased())
            .font(.system(size: 11, weight: .heavy, design: .rounded))
            .foregroundColor(tickColor.opacity(0.6))
        context.draw(caption, at: CGPoint(x: baselineX + 6, y: 10), anchor: .leading)
    }

    /// Identifies the "half unit" tick so it can be drawn slightly longer.
    private func isHalfTick(index: Int, subdivisions: Int) -> Bool {
        guard subdivisions % 2 == 0 else { return false }
        return index % subdivisions == subdivisions / 2
    }
}

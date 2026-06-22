import SwiftUI
import UIKit

/// Lightweight burst of confetti for celebrating high scores. Backed by
/// `CAEmitterLayer` so it's smooth and cheap. Emits a short burst, then stops.
struct ConfettiView: UIViewRepresentable {
    var colors: [UIColor] = [
        UIColor(Theme.coral), UIColor(Theme.rose),
        UIColor(Theme.orchid), UIColor(Theme.mint),
        UIColor(Color(hex: 0xFFC93C))
    ]

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.isUserInteractionEnabled = false
        view.clipsToBounds = false
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        // Defer so the view has a real size before we emit.
        DispatchQueue.main.async {
            guard uiView.layer.sublayers?.contains(where: { $0 is CAEmitterLayer }) != true else { return }
            let width = uiView.bounds.width > 0 ? uiView.bounds.width : UIScreen.main.bounds.width

            let emitter = CAEmitterLayer()
            emitter.emitterShape = .line
            emitter.emitterPosition = CGPoint(x: width / 2, y: -20)
            emitter.emitterSize = CGSize(width: width, height: 1)
            emitter.emitterCells = colors.map { cell(color: $0) }
            uiView.layer.addSublayer(emitter)

            // Burst, then settle.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
                emitter.birthRate = 0
            }
        }
    }

    private func cell(color: UIColor) -> CAEmitterCell {
        let cell = CAEmitterCell()
        cell.birthRate = 7
        cell.lifetime = 6
        cell.velocity = 230
        cell.velocityRange = 90
        cell.emissionLongitude = .pi
        cell.emissionRange = .pi / 5
        cell.spin = 3.5
        cell.spinRange = 4
        cell.scale = 0.5
        cell.scaleRange = 0.3
        cell.color = color.cgColor
        cell.contents = Self.confettiImage.cgImage
        return cell
    }

    /// A small rounded rectangle drawn once and reused for every particle.
    private static let confettiImage: UIImage = {
        let size = CGSize(width: 9, height: 14)
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { ctx in
            UIColor.white.setFill()
            UIBezierPath(roundedRect: CGRect(origin: .zero, size: size), cornerRadius: 3).fill()
        }
    }()
}

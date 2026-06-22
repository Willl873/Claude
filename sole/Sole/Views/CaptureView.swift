import SwiftUI
import PhotosUI

/// Step 1 of the rating flow: choose a photo (camera or library) plus a few
/// quick framing tips so results come out their best.
struct CaptureView: View {
    let bodyPart: BodyPart
    var onImage: (UIImage) -> Void
    var onClose: () -> Void

    @State private var pickerItem: PhotosPickerItem?
    @State private var showCamera = false
    @State private var isLoading = false

    private var cameraAvailable: Bool {
        UIImagePickerController.isSourceTypeAvailable(.camera)
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            Spacer(minLength: 12)

            illustration

            Spacer(minLength: 12)

            tips
                .padding(.horizontal, 22)

            Spacer(minLength: 24)

            controls
                .padding(.horizontal, 22)
                .padding(.bottom, 28)
        }
        .overlay {
            if isLoading {
                ProgressView()
                    .controlSize(.large)
                    .padding(26)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18))
            }
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraPicker { image in onImage(image) }
                .ignoresSafeArea()
        }
        .onChange(of: pickerItem) { _, newValue in
            guard let newValue else { return }
            isLoading = true
            Task {
                if let data = try? await newValue.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await MainActor.run { onImage(image) }
                }
                await MainActor.run { isLoading = false }
            }
        }
    }

    // MARK: Pieces

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Rate my \(bodyPart.possessiveNoun)")
                    .font(Theme.display(26))
                Text(bodyPart.tagline)
                    .font(Theme.rounded(14, .medium))
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button {
                Haptics.tap()
                onClose()
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(.secondary)
                    .padding(11)
                    .background(.ultraThinMaterial, in: Circle())
            }
        }
        .padding(.horizontal, 22)
        .padding(.top, 18)
    }

    private var illustration: some View {
        ZStack {
            Circle()
                .fill(Theme.brandGradient)
                .frame(width: 190, height: 190)
                .blur(radius: 50)
                .opacity(0.55)

            Image(systemName: bodyPart.symbol)
                .font(.system(size: 84, weight: .regular))
                .foregroundStyle(Theme.brandGradient)
                .shadow(color: Theme.rose.opacity(0.3), radius: 12)
        }
    }

    private var tips: some View {
        HStack(spacing: 14) {
            tip(icon: "sun.max.fill", text: "Good light")
            tip(icon: "camera.viewfinder", text: "Fill the frame")
            tip(icon: "sparkles", text: "Clean & dry")
        }
        .glassCard(padding: 16)
    }

    private func tip(icon: String, text: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(Theme.rose)
            Text(text)
                .font(Theme.rounded(12, .semibold))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    private var controls: some View {
        VStack(spacing: 12) {
            if cameraAvailable {
                PrimaryButton(title: "Take a Photo", systemImage: "camera.fill") {
                    showCamera = true
                }
            }

            PhotosPicker(selection: $pickerItem, matching: .images, photoLibrary: .shared()) {
                HStack(spacing: 10) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 17, weight: .bold))
                    Text("Choose from Library")
                        .font(Theme.rounded(18, .bold))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 17)
                .foregroundStyle(cameraAvailable ? Theme.rose : .white)
                .background {
                    if cameraAvailable {
                        Capsule().fill(.ultraThinMaterial)
                        Capsule().stroke(Theme.rose.opacity(0.5), lineWidth: 1.5)
                    } else {
                        Capsule().fill(Theme.brandGradient)
                    }
                }
            }

            Text("Photos are analysed privately on your device.")
                .font(Theme.rounded(12, .medium))
                .foregroundStyle(.secondary)
                .padding(.top, 2)
        }
    }
}

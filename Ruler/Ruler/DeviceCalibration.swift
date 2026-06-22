import UIKit

/// Provides an accurate conversion between SwiftUI logical points and real-world
/// physical units (inches / centimeters) for the device the app is running on.
///
/// iOS does not expose the physical pixel density of the display directly, so we
/// rely on a lookup table of the marketed physical PPI for every iPhone model,
/// keyed by hardware identifier (e.g. `iPhone15,2`). Combined with the screen's
/// `nativeScale` (physical pixels per logical point) this yields the number of
/// logical points that span exactly one inch on the glass:
///
///     pointsPerInch = physicalPPI / nativeScale
///
/// This is exact for non‑downsampled Retina displays (163 pt/in) and remains
/// correct for the downsampled "Plus" panels because both the marketed PPI and
/// the `nativeScale` describe the real, rendered pixel grid.
enum DeviceCalibration {

    /// Marketed physical pixel density (pixels per inch) for each iPhone, keyed
    /// by hardware model identifier.
    static let ppiByIdentifier: [String: Double] = [
        // iPhone 6s / 6s Plus / SE (1st gen)
        "iPhone8,1": 326, "iPhone8,2": 401, "iPhone8,4": 326,
        // iPhone 7 / 7 Plus
        "iPhone9,1": 326, "iPhone9,3": 326, "iPhone9,2": 401, "iPhone9,4": 401,
        // iPhone 8 / 8 Plus / X
        "iPhone10,1": 326, "iPhone10,4": 326, "iPhone10,2": 401, "iPhone10,5": 401,
        "iPhone10,3": 458, "iPhone10,6": 458,
        // iPhone XS / XS Max / XR
        "iPhone11,2": 458, "iPhone11,4": 458, "iPhone11,6": 458, "iPhone11,8": 326,
        // iPhone 11 / 11 Pro / 11 Pro Max / SE (2nd gen)
        "iPhone12,1": 326, "iPhone12,3": 458, "iPhone12,5": 458, "iPhone12,8": 326,
        // iPhone 12 mini / 12 / 12 Pro / 12 Pro Max
        "iPhone13,1": 476, "iPhone13,2": 460, "iPhone13,3": 460, "iPhone13,4": 458,
        // iPhone 13 mini / 13 / 13 Pro / 13 Pro Max / SE (3rd gen)
        "iPhone14,4": 476, "iPhone14,5": 460, "iPhone14,2": 460, "iPhone14,3": 458,
        "iPhone14,6": 326,
        // iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max
        "iPhone14,7": 460, "iPhone14,8": 458, "iPhone15,2": 460, "iPhone15,3": 460,
        // iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max
        "iPhone15,4": 460, "iPhone15,5": 460, "iPhone16,1": 460, "iPhone16,2": 460,
        // iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max
        "iPhone17,3": 460, "iPhone17,4": 460, "iPhone17,1": 460, "iPhone17,2": 460,
    ]

    /// The hardware model identifier of the current device, e.g. `iPhone15,2`.
    static var modelIdentifier: String {
        #if targetEnvironment(simulator)
        if let id = ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] {
            return id
        }
        #endif
        var systemInfo = utsname()
        uname(&systemInfo)
        let mirror = Mirror(reflecting: systemInfo.machine)
        return mirror.children.reduce(into: "") { identifier, element in
            guard let value = element.value as? Int8, value != 0 else { return }
            identifier.append(Character(UnicodeScalar(UInt8(value))))
        }
    }

    /// Physical pixels per inch for the current device. Falls back to a sensible
    /// estimate based on `nativeScale` for unknown / future models.
    static var physicalPPI: Double {
        if let ppi = ppiByIdentifier[modelIdentifier] {
            return ppi
        }
        let scale = UIScreen.main.nativeScale
        if scale >= 3 { return 458 } // Super Retina class
        if scale >= 2 { return 326 } // Retina class
        return 163                   // Non‑Retina fallback
    }

    /// `true` when the running device is not in the lookup table and the value is
    /// an estimate. Useful for surfacing a calibration hint in the UI.
    static var isEstimated: Bool {
        ppiByIdentifier[modelIdentifier] == nil
    }

    // MARK: - Manual calibration override

    /// UserDefaults key for a user‑provided points‑per‑inch value, set via the
    /// "match a card" calibration screen. Read by `@AppStorage` in the UI so the
    /// ruler refreshes immediately when it changes.
    static let manualCalibrationKey = "manualPointsPerInch"

    /// A user‑measured points‑per‑inch value, or `nil` when using automatic
    /// calibration. Stored in logical points so it is orientation‑independent.
    static var manualPointsPerInch: Double? {
        get {
            let value = UserDefaults.standard.double(forKey: manualCalibrationKey)
            return value > 0 ? value : nil
        }
        set {
            if let value = newValue, value > 0 {
                UserDefaults.standard.set(value, forKey: manualCalibrationKey)
            } else {
                UserDefaults.standard.removeObject(forKey: manualCalibrationKey)
            }
        }
    }

    /// `true` when the ruler is using a value the user dialled in by hand.
    static var isManuallyCalibrated: Bool {
        manualPointsPerInch != nil
    }

    /// Logical points that span exactly one inch on this display. A manual
    /// override always wins over the automatic device estimate.
    static var pointsPerInch: Double {
        if let manual = manualPointsPerInch {
            return manual
        }
        return physicalPPI / Double(UIScreen.main.nativeScale)
    }

    /// Logical points that span exactly one centimeter on this display.
    static var pointsPerCentimeter: Double {
        pointsPerInch / 2.54
    }
}

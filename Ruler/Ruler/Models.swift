import SwiftUI

/// The unit the ruler is calibrated and labelled in.
enum MeasurementUnit: String, CaseIterable, Identifiable {
    case centimeters
    case inches

    var id: String { rawValue }

    /// Short label shown on the unit toggle and next to readouts.
    var label: String {
        switch self {
        case .centimeters: return "cm"
        case .inches:      return "in"
        }
    }

    /// Number of logical points that span one whole unit on the current device.
    var pointsPerUnit: Double {
        switch self {
        case .centimeters: return DeviceCalibration.pointsPerCentimeter
        case .inches:      return DeviceCalibration.pointsPerInch
        }
    }

    /// Number of evenly spaced subdivisions drawn within each whole unit.
    /// (10 millimetre ticks per cm, 8 eighth‑inch ticks per inch.)
    var subdivisions: Int {
        switch self {
        case .centimeters: return 10
        case .inches:      return 8
        }
    }

    /// Format a measurement value for display.
    func string(for value: Double) -> String {
        switch self {
        case .centimeters: return String(format: "%.1f %@", value, label)
        case .inches:      return String(format: "%.2f %@", value, label)
        }
    }
}

/// Whether one or two measuring markers are shown.
enum MarkerMode: String, CaseIterable, Identifiable {
    case single
    case double

    var id: String { rawValue }

    var label: String {
        switch self {
        case .single: return "Single"
        case .double: return "Double"
        }
    }
}

/// User‑selectable appearance, independent of the editor — satisfies the
/// requirement for an explicit light and dark mode while still allowing the
/// device default.
enum AppearanceMode: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var label: String {
        switch self {
        case .system: return "Auto"
        case .light:  return "Light"
        case .dark:   return "Dark"
        }
    }

    var symbol: String {
        switch self {
        case .system: return "circle.lefthalf.filled"
        case .light:  return "sun.max.fill"
        case .dark:   return "moon.fill"
        }
    }

    /// `nil` lets the system decide; otherwise force the chosen scheme.
    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light:  return .light
        case .dark:   return .dark
        }
    }
}

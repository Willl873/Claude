import UIKit
import Observation

/// Owns the user's rating history and the photos that go with it.
///
/// Ratings persist as a single JSON file; photos live as JPEGs in a dedicated
/// folder. Everything stays on-device. Marked `@Observable` so SwiftUI views
/// refresh automatically when the history changes.
@Observable
final class HistoryStore {

    private(set) var ratings: [Rating] = []

    private let fileManager = FileManager.default

    init() {
        load()
    }

    // MARK: - Derived stats (power the home screen)

    var count: Int { ratings.count }

    var best: Rating? {
        ratings.max { $0.overall < $1.overall }
    }

    var average: Double {
        guard !ratings.isEmpty else { return 0 }
        return ratings.reduce(0) { $0 + $1.overall } / Double(ratings.count)
    }

    /// Consecutive-day rating streak, counting back from today.
    var streak: Int {
        let cal = Calendar.current
        let days = Set(ratings.map { cal.startOfDay(for: $0.date) })
        guard !days.isEmpty else { return 0 }

        var streak = 0
        var day = cal.startOfDay(for: Date())
        // Allow the streak to "start" yesterday if they haven't rated today yet.
        if !days.contains(day) {
            guard let yesterday = cal.date(byAdding: .day, value: -1, to: day) else { return 0 }
            day = yesterday
            if !days.contains(day) { return 0 }
        }
        while days.contains(day) {
            streak += 1
            guard let prev = cal.date(byAdding: .day, value: -1, to: day) else { break }
            day = prev
        }
        return streak
    }

    // MARK: - Mutations

    /// Saves the photo to disk, stamps the rating with the filename, prepends it
    /// to history and returns the finalised rating.
    @discardableResult
    func add(_ rating: Rating, image: UIImage) -> Rating {
        let fileName = "\(rating.id.uuidString).jpg"
        saveImage(image, named: fileName)

        let stored = Rating(
            id: rating.id,
            date: rating.date,
            bodyPart: rating.bodyPart,
            overall: rating.overall,
            dimensions: rating.dimensions,
            imageFileName: fileName,
            verdictTitle: rating.verdictTitle,
            verdictBlurb: rating.verdictBlurb
        )

        ratings.insert(stored, at: 0)
        save()
        return stored
    }

    func delete(_ rating: Rating) {
        ratings.removeAll { $0.id == rating.id }
        try? fileManager.removeItem(at: imageURL(for: rating.imageFileName))
        save()
    }

    func clearAll() {
        for rating in ratings {
            try? fileManager.removeItem(at: imageURL(for: rating.imageFileName))
        }
        ratings.removeAll()
        save()
    }

    func image(for rating: Rating) -> UIImage? {
        UIImage(contentsOfFile: imageURL(for: rating.imageFileName).path)
    }

    // MARK: - Persistence

    private var documents: URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private var ratingsURL: URL {
        documents.appendingPathComponent("ratings.json")
    }

    private var imagesDirectory: URL {
        let dir = documents.appendingPathComponent("SoleImages", isDirectory: true)
        if !fileManager.fileExists(atPath: dir.path) {
            try? fileManager.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        return dir
    }

    private func imageURL(for name: String) -> URL {
        imagesDirectory.appendingPathComponent(name)
    }

    private func saveImage(_ image: UIImage, named name: String) {
        guard let data = image.jpegData(compressionQuality: 0.85) else { return }
        try? data.write(to: imageURL(for: name))
    }

    private func save() {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted]
        encoder.dateEncodingStrategy = .iso8601
        guard let data = try? encoder.encode(ratings) else { return }
        try? data.write(to: ratingsURL)
    }

    private func load() {
        guard let data = try? Data(contentsOf: ratingsURL) else { return }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        ratings = (try? decoder.decode([Rating].self, from: data)) ?? []
    }
}

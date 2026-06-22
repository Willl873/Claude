import Foundation

/// A single dimension's result within a rating.
struct DimensionScore: Codable, Hashable, Identifiable {
    let dimension: RatingDimension
    let score: Double      // 0...10
    let note: String

    var id: String { dimension.rawValue }
}

/// A completed rating of one photo.
///
/// `Codable` so it can be persisted to disk as JSON. The photo itself is stored
/// separately as a file and referenced by `imageFileName` to keep the JSON tiny.
struct Rating: Identifiable, Codable, Hashable {
    let id: UUID
    let date: Date
    let bodyPart: BodyPart
    let overall: Double            // 0...10, one decimal
    let dimensions: [DimensionScore]
    let imageFileName: String
    let verdictTitle: String
    let verdictBlurb: String

    init(
        id: UUID = UUID(),
        date: Date = Date(),
        bodyPart: BodyPart,
        overall: Double,
        dimensions: [DimensionScore],
        imageFileName: String,
        verdictTitle: String,
        verdictBlurb: String
    ) {
        self.id = id
        self.date = date
        self.bodyPart = bodyPart
        self.overall = overall
        self.dimensions = dimensions
        self.imageFileName = imageFileName
        self.verdictTitle = verdictTitle
        self.verdictBlurb = verdictBlurb
    }

    /// "8.4" style display string.
    var overallText: String { String(format: "%.1f", overall) }
}

import Foundation
import ImageIO
import Vision

func recognize(_ imagePath: String) throws -> String {
  let url = URL(fileURLWithPath: imagePath) as CFURL
  guard let source = CGImageSourceCreateWithURL(url, nil),
        let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    throw NSError(domain: "contact-sheet-ocr", code: 1,
                  userInfo: [NSLocalizedDescriptionKey: "Unable to decode \(imagePath)"])
  }

  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.usesLanguageCorrection = true
  request.recognitionLanguages = ["ko-KR", "en-US"]
  let handler = VNImageRequestHandler(cgImage: image, options: [:])
  try handler.perform([request])

  return (request.results ?? [])
    .compactMap { $0.topCandidates(1).first?.string }
    .joined(separator: "\n")
}

let paths = Array(CommandLine.arguments.dropFirst())
guard !paths.isEmpty else {
  FileHandle.standardError.write(Data("usage: extract-contact-sheet-text.swift SHEET...\n".utf8))
  exit(2)
}

var failures = 0
for sheetPath in paths {
  do {
    let text = try recognize(sheetPath)
    let suffix = ".sheet.jpg"
    let outputPath = sheetPath.hasSuffix(suffix)
      ? String(sheetPath.dropLast(suffix.count)) + ".visual.txt"
      : sheetPath + ".visual.txt"
    try (text + "\n").write(toFile: outputPath, atomically: true, encoding: .utf8)
    print("OCR\t\(sheetPath)\t\(text.split(whereSeparator: { $0.isWhitespace }).count)")
  } catch {
    failures += 1
    FileHandle.standardError.write(Data("OCR_FAILED\t\(sheetPath)\t\(error)\n".utf8))
  }
}

if failures > 0 { exit(1) }

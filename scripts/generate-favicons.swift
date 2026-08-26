// Optional macOS asset utility: swift scripts/generate-favicons.swift
// The generated PNGs are checked in; the website needs no build step.
import AppKit

func drawIcon(size: Int, filename: String) throws {
    let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
        isPlanar: false, colorSpaceName: .deviceRGB,
        bytesPerRow: 0, bitsPerPixel: 0
    )!
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.cgContext.scaleBy(x: CGFloat(size) / 64, y: CGFloat(size) / 64)
    NSColor(srgbRed: 23 / 255, green: 59 / 255, blue: 49 / 255, alpha: 1).setFill()
    NSBezierPath(roundedRect: NSRect(x: 0, y: 0, width: 64, height: 64), xRadius: 14, yRadius: 14).fill()

    let letters = NSAttributedString(string: "ZC", attributes: [
        .font: NSFont(name: "AvenirNext-DemiBold", size: 31) ?? NSFont.systemFont(ofSize: 31, weight: .semibold),
        .foregroundColor: NSColor(srgbRed: 249 / 255, green: 246 / 255, blue: 237 / 255, alpha: 1),
        .kern: -1.2
    ])
    let textSize = letters.size()
    letters.draw(at: NSPoint(x: (64 - textSize.width) / 2, y: (64 - textSize.height) / 2 + 2))
    NSColor(srgbRed: 201 / 255, green: 105 / 255, blue: 67 / 255, alpha: 1).setFill()
    NSBezierPath(ovalIn: NSRect(x: 30, y: 10, width: 4, height: 4)).fill()
    NSGraphicsContext.restoreGraphicsState()
    try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: filename))
}

try drawIcon(size: 32, filename: "assets/images/favicon-zc-32.png")
try drawIcon(size: 64, filename: "assets/images/favicon-zc-64.png")
try drawIcon(size: 180, filename: "assets/images/apple-touch-icon-zc.png")

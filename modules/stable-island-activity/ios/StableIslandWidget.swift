import WidgetKit
import SwiftUI

struct StableIslandWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: TransactionAttributes.self) { context in
      LockScreenBanner(context: context)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          ExpandedLeadingView(context: context)
        }
        DynamicIslandExpandedRegion(.trailing) {
          ExpandedTrailingView(context: context)
        }
        DynamicIslandExpandedRegion(.bottom) {
          ExpandedBottomView(context: context)
        }
      } compactLeading: {
        CompactLeadingView(context: context)
      } compactTrailing: {
        CompactTrailingView(context: context)
      } minimal: {
        MinimalView(context: context)
      }
    }
  }
}

// MARK: - Compact Views

struct CompactLeadingView: View {
  let context: ActivityViewContext<TransactionAttributes>

  var body: some View {
    Circle()
      .fill(stageColor)
      .frame(width: 12, height: 12)
  }

  private var stageColor: Color {
    switch context.state.stage {
    case "burning": return Color(red: 1, green: 0.27, blue: 0.27)
    case "attesting": return Color(red: 1, green: 0.68, blue: 0.0)
    case "minting": return Color(red: 0.0, green: 0.78, blue: 1.0)
    case "settled": return Color(red: 0.0, green: 0.88, blue: 0.62)
    case "failed": return Color(red: 0.95, green: 0.25, blue: 0.36)
    default: return .gray
    }
  }
}

struct CompactTrailingView: View {
  let context: ActivityViewContext<TransactionAttributes>

  var body: some View {
    Text(stageLabel)
      .font(.system(size: 12, weight: .bold, design: .rounded))
      .foregroundStyle(.white)
  }

  private var stageLabel: String {
    switch context.state.stage {
    case "burning": return "Burning"
    case "attesting": return "Attesting"
    case "minting": return "Minting"
    case "settled": return "Settled"
    case "failed": return "Failed"
    default: return "..."
    }
  }
}

// MARK: - Minimal View

struct MinimalView: View {
  let context: ActivityViewContext<TransactionAttributes>

  var body: some View {
    Circle()
      .fill(stageColor)
      .frame(width: 10, height: 10)
  }

  private var stageColor: Color {
    switch context.state.stage {
    case "burning": return Color(red: 1, green: 0.27, blue: 0.27)
    case "attesting": return Color(red: 1, green: 0.68, blue: 0.0)
    case "minting": return Color(red: 0.0, green: 0.78, blue: 1.0)
    case "settled": return Color(red: 0.0, green: 0.88, blue: 0.62)
    case "failed": return Color(red: 0.95, green: 0.25, blue: 0.36)
    default: return .gray
    }
  }
}

// MARK: - Expanded Views

struct ExpandedLeadingView: View {
  let context: ActivityViewContext<TransactionAttributes>

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(context.attributes.title)
        .font(.system(size: 14, weight: .bold, design: .rounded))
        .foregroundStyle(.white)

      Text(context.attributes.subtitle)
        .font(.system(size: 11, weight: .medium, design: .rounded))
        .foregroundStyle(.white.opacity(0.6))
    }
  }
}

struct ExpandedTrailingView: View {
  let context: ActivityViewContext<TransactionAttributes>

  var body: some View {
    VStack(alignment: .trailing, spacing: 4) {
      Text(stageLabel)
        .font(.system(size: 11, weight: .bold, design: .rounded))
        .foregroundStyle(stageColor)

      Text("\(Int(context.state.progress))%")
        .font(.system(size: 20, weight: .bold, design: .rounded))
        .foregroundStyle(.white)
    }
  }

  private var stageLabel: String {
    switch context.state.stage {
    case "burning": return "BURNING"
    case "attesting": return "ATTESTING"
    case "minting": return "MINTING"
    case "settled": return "SETTLED"
    case "failed": return "FAILED"
    default: return "..."
    }
  }

  private var stageColor: Color {
    switch context.state.stage {
    case "burning": return Color(red: 1, green: 0.27, blue: 0.27)
    case "attesting": return Color(red: 1, green: 0.68, blue: 0.0)
    case "minting": return Color(red: 0.0, green: 0.78, blue: 1.0)
    case "settled": return Color(red: 0.0, green: 0.88, blue: 0.62)
    case "failed": return Color(red: 0.95, green: 0.25, blue: 0.36)
    default: return .gray
    }
  }
}

struct ExpandedBottomView: View {
  let context: ActivityViewContext<TransactionAttributes>

  var body: some View {
    VStack(spacing: 8) {
      GeometryReader { geometry in
        ZStack(alignment: .leading) {
          RoundedRectangle(cornerRadius: 3)
            .fill(.white.opacity(0.12))
            .frame(height: 6)

          RoundedRectangle(cornerRadius: 3)
            .fill(stageColor)
            .frame(width: max(6, geometry.size.width * context.state.progress / 100), height: 6)
        }
      }
      .frame(height: 6)

      HStack {
        HStack(spacing: 4) {
          Circle().fill(stageColor).frame(width: 6, height: 6)
          Text(stageLabel)
            .font(.system(size: 10, weight: .semibold, design: .rounded))
            .foregroundStyle(.white.opacity(0.7))
        }
        Spacer()
        Text("\(Int(context.state.progress))% complete")
          .font(.system(size: 10, weight: .medium, design: .rounded))
          .foregroundStyle(.white.opacity(0.5))
      }
    }
  }

  private var stageColor: Color {
    switch context.state.stage {
    case "burning": return Color(red: 1, green: 0.27, blue: 0.27)
    case "attesting": return Color(red: 1, green: 0.68, blue: 0.0)
    case "minting": return Color(red: 0.0, green: 0.78, blue: 1.0)
    case "settled": return Color(red: 0.0, green: 0.88, blue: 0.62)
    case "failed": return Color(red: 0.95, green: 0.25, blue: 0.36)
    default: return .gray
    }
  }

  private var stageLabel: String {
    switch context.state.stage {
    case "burning": return "Burning"
    case "attesting": return "Attesting"
    case "minting": return "Minting"
    case "settled": return "Settled"
    case "failed": return "Failed"
    default: return "..."
    }
  }
}

// MARK: - Lock Screen (not used but required)

struct LockScreenBanner: View {
  let context: ActivityViewContext<TransactionAttributes>

  var body: some View {
    HStack {
      Circle()
        .fill(stageColor)
        .frame(width: 10, height: 10)
      Text(context.attributes.title)
        .font(.system(size: 13, weight: .semibold))
      Spacer()
      Text("\(Int(context.state.progress))%")
        .font(.system(size: 13, weight: .bold))
    }
  }

  private var stageColor: Color {
    switch context.state.stage {
    case "burning": return .red
    case "attesting": return .orange
    case "minting": return .cyan
    case "settled": return .green
    case "failed": return .red
    default: return .gray
    }
  }
}

// MARK: - Widget Bundle

@main
struct StableIslandWidgetBundle: WidgetBundle {
  var body: some Widget {
    StableIslandWidget()
  }
}

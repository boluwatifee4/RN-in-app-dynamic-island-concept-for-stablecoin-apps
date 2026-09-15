import ExpoModulesCore
import ActivityKit

public class StableIslandActivityModule: Module {
  private var currentActivity: Activity<TransactionAttributes>?

  public func definition() -> ModuleDefinition {
    Name("StableIslandActivity")

    AsyncFunction("startActivity") { (title: String, subtitle: String, type: String) -> String in
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        return "disabled"
      }

      let attributes = TransactionAttributes(title: title, subtitle: subtitle, type: type)
      let initialState = TransactionAttributes.ContentState(stage: "burning", progress: 0)

      do {
        let activity = try Activity.request(
          attributes: attributes,
          content: .init(state: initialState, staleDate: nil)
        )
        self.currentActivity = activity
        return activity.id
      } catch {
        return "error: \(error.localizedDescription)"
      }
    }

    AsyncFunction("updateActivity") { (stage: String, progress: Double) -> Void in
      guard let activity = self.currentActivity else { return }

      let newState = TransactionAttributes.ContentState(stage: stage, progress: progress)
      await activity.update(.init(state: newState, staleDate: nil))
    }

    AsyncFunction("endActivity") { (finalStage: String) -> Void in
      guard let activity = self.currentActivity else { return }

      let finalState = TransactionAttributes.ContentState(stage: finalStage, progress: finalStage == "settled" ? 100 : 0)
      await activity.end(.init(state: finalState, staleDate: nil), dismissalPolicy: .after(.seconds(5)))
      self.currentActivity = nil
    }
  }
}

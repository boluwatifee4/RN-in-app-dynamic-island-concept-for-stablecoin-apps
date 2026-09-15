import ActivityKit
import Foundation

struct TransactionAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var stage: String
    var progress: Double
  }

  var title: String
  var subtitle: String
  var type: String
}

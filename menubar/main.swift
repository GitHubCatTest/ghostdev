import AppKit
import Foundation

struct ZombieItem: Codable {
    let id: String
    let type: String
    let name: String
    let framework: String?
    let pid: Int
    let rssBytes: Int
    let rssFormatted: string
    let cpuPercent: Double
    let uptime: String
    let ports: [Int]
    let reason: String
    let killable: Bool
    
    enum CodingKeys: String, CodingKey {
        case id, type, name, framework, pid, rssBytes, rssFormatted, cpuPercent, uptime, ports, reason, killable
    }
}

typealias string = String

struct ScanResult: Codable {
    let items: [ZombieItem]
    let totalRssBytes: Int
    let totalRssFormatted: String
}

class GhostDevMenuDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    var statusItem: NSStatusItem!
    var menu: NSMenu!
    var timer: Timer?
    var latestResult: ScanResult?
    var isScanning = false
    var lastCcNotificationDate: Date?

    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            button.title = "👻"
            button.toolTip = "GhostDev: Forgotten Dev Server & Memory Reaper"
        }
        
        menu = NSMenu()
        menu.delegate = self
        statusItem.menu = menu
        
        buildInitialMenu()
        runScan()
        
        // Timer to refresh every 30 seconds
        timer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self] _ in
            self?.runScan()
        }
    }
    
    func buildInitialMenu() {
        menu.removeAllItems()
        let titleItem = NSMenuItem(title: "👻 GhostDev", action: nil, keyEquivalent: "")
        titleItem.isEnabled = false
        menu.addItem(titleItem)
        
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Scanning for idle processes...", action: nil, keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        
        let quitItem = NSMenuItem(title: "Quit GhostDev", action: #selector(quitApp), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)
    }
    
    func runScan() {
        guard !isScanning else { return }
        isScanning = true
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            let result = self.executeScan()
            
            DispatchQueue.main.async {
                self.isScanning = false
                self.latestResult = result
                self.updateMenu(with: result)
                self.checkProactiveAlerts(result: result)
            }
        }
    }
    
    func checkProactiveAlerts(result: ScanResult?) {
        guard let result = result else { return }
        if let cc = result.items.first(where: { $0.type == "memory-leak" && $0.name.contains("Control Center") }) {
            // If leaking >= 800 MB and we haven't notified in the last 45 minutes
            if cc.rssBytes >= 800 * 1024 * 1024 {
                let shouldNotify: Bool
                if let last = lastCcNotificationDate {
                    shouldNotify = Date().timeIntervalSince(last) >= 2700
                } else {
                    shouldNotify = true
                }
                
                if shouldNotify {
                    lastCcNotificationDate = Date()
                    sendNotification(
                        title: "👻 GhostDev: Control Center Memory Leak",
                        message: "Control Center is using \(cc.rssFormatted) RAM. Click the menu bar icon to restart it."
                    )
                }
            }
        }
    }
    
    func sendNotification(title: String, message: String) {
        let cleanTitle = title.replacingOccurrences(of: "\"", with: "\\\"")
        let cleanMessage = message.replacingOccurrences(of: "\"", with: "\\\"")
        let script = "display notification \"\(cleanMessage)\" with title \"\(cleanTitle)\" sound name \"Blow\""
        let task = Process()
        task.launchPath = "/usr/bin/osascript"
        task.arguments = ["-e", script]
        try? task.run()
    }
    
    func findNodeExecutable() -> String {
        let home = NSHomeDirectory()
        let candidates = [
            "/opt/homebrew/bin/node",
            "/usr/local/bin/node",
            "\(home)/.homebrew/bin/node",
            "\(home)/.local/bin/node",
            "\(home)/.hermes/node/bin/node",
            "\(home)/.nvm/current/bin/node"
        ]
        for c in candidates {
            if FileManager.default.fileExists(atPath: c) {
                return c
            }
        }
        return "/usr/bin/env"
    }

    func findCliScriptPath() -> String? {
        let bundlePath = Bundle.main.bundlePath
        let candidates = [
            URL(fileURLWithPath: bundlePath).deletingLastPathComponent().appendingPathComponent("../dist/bin/ghostdev.js").path,
            URL(fileURLWithPath: bundlePath).deletingLastPathComponent().appendingPathComponent("dist/bin/ghostdev.js").path,
            "\(NSHomeDirectory())/.gemini/antigravity/scratch/ghostdev/dist/bin/ghostdev.js",
            "/usr/local/bin/ghostdev",
            "/opt/homebrew/bin/ghostdev"
        ]
        for c in candidates {
            if FileManager.default.fileExists(atPath: c) {
                return c
            }
        }
        return nil
    }

    func executeScan() -> ScanResult? {
        let task = Process()
        let pipe = Pipe()
        let nodePath = findNodeExecutable()
        
        if let cliScript = findCliScriptPath() {
            if cliScript.hasSuffix(".js") {
                if nodePath == "/usr/bin/env" {
                    task.launchPath = "/usr/bin/env"
                    task.arguments = ["node", cliScript, "scan", "--json"]
                } else {
                    task.launchPath = nodePath
                    task.arguments = [cliScript, "scan", "--json"]
                }
            } else {
                task.launchPath = cliScript
                task.arguments = ["scan", "--json"]
            }
        } else {
            task.launchPath = "/usr/bin/env"
            task.arguments = ["ghostdev", "scan", "--json"]
        }
        
        task.standardOutput = pipe
        task.standardError = Pipe()
        
        do {
            try task.run()
            task.waitUntilExit()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let decoder = JSONDecoder()
            return try decoder.decode(ScanResult.self, from: data)
        } catch {
            return nil
        }
    }
    
    func updateMenu(with result: ScanResult?) {
        guard let button = statusItem.button else { return }
        
        menu.removeAllItems()
        
        // Header
        let headerItem = NSMenuItem(title: "👻 GhostDev", action: nil, keyEquivalent: "")
        headerItem.attributedTitle = NSAttributedString(
            string: "👻 GhostDev",
            attributes: [.font: NSFont.boldSystemFont(ofSize: 13)]
        )
        menu.addItem(headerItem)
        menu.addItem(NSMenuItem.separator())
        
        guard let result = result else {
            button.title = "👻"
            menu.addItem(NSMenuItem(title: "Error checking processes", action: nil, keyEquivalent: ""))
            addBottomActions()
            return
        }
        
        if result.items.isEmpty {
            button.title = "👻"
            let cleanItem = NSMenuItem(title: "✔ All clean! No zombie processes", action: nil, keyEquivalent: "")
            cleanItem.isEnabled = false
            menu.addItem(cleanItem)
        } else {
            button.title = "👻 \(result.totalRssFormatted)"
            
            // Check if Control Center is leaking specifically
            if let ccLeak = result.items.first(where: { $0.type == "memory-leak" && $0.name.contains("Control Center") }) {
                let ccAlertItem = NSMenuItem(
                    title: "🚨 Control Center Leaking: \(ccLeak.rssFormatted)",
                    action: nil,
                    keyEquivalent: ""
                )
                ccAlertItem.attributedTitle = NSAttributedString(
                    string: "🚨 Control Center Leaking: \(ccLeak.rssFormatted)",
                    attributes: [.font: NSFont.boldSystemFont(ofSize: 12), .foregroundColor: NSColor.systemRed]
                )
                ccAlertItem.isEnabled = false
                menu.addItem(ccAlertItem)
                
                let restartCcBtn = NSMenuItem(
                    title: "🔄 Restart Control Center (Free \(ccLeak.rssFormatted))",
                    action: #selector(restartControlCenterAction),
                    keyEquivalent: ""
                )
                restartCcBtn.target = self
                menu.addItem(restartCcBtn)
                menu.addItem(NSMenuItem.separator())
            }
            
            let summaryItem = NSMenuItem(
                title: "Found \(result.items.count) idle processes (\(result.totalRssFormatted) wasted)",
                action: nil,
                keyEquivalent: ""
            )
            summaryItem.isEnabled = false
            menu.addItem(summaryItem)
            menu.addItem(NSMenuItem.separator())
            
            for item in result.items {
                let portInfo = item.ports.isEmpty ? "" : " :\(item.ports.map(String.init).joined(separator: ", :"))"
                let title = "\(item.name)\(portInfo) • \(item.rssFormatted)"
                
                let processItem = NSMenuItem(title: title, action: nil, keyEquivalent: "")
                processItem.representedObject = item
                
                let subMenu = NSMenu()
                let reasonItem = NSMenuItem(title: item.reason, action: nil, keyEquivalent: "")
                reasonItem.isEnabled = false
                subMenu.addItem(reasonItem)
                
                let statsItem = NSMenuItem(title: "Uptime: \(item.uptime) • CPU: \(String(format: "%.1f", item.cpuPercent))%", action: nil, keyEquivalent: "")
                statsItem.isEnabled = false
                subMenu.addItem(statsItem)
                
                subMenu.addItem(NSMenuItem.separator())
                
                if item.type == "memory-leak" && item.name.contains("Control Center") {
                    let restartItem = NSMenuItem(
                        title: "🔄 Restart Control Center & Free \(item.rssFormatted)",
                        action: #selector(restartControlCenterAction),
                        keyEquivalent: ""
                    )
                    restartItem.target = self
                    subMenu.addItem(restartItem)
                } else {
                    let killItem = NSMenuItem(
                        title: "Stop & Free \(item.rssFormatted)",
                        action: #selector(killSingleItem(_:)),
                        keyEquivalent: ""
                    )
                    killItem.target = self
                    killItem.representedObject = item
                    subMenu.addItem(killItem)
                }
                
                processItem.submenu = subMenu
                menu.addItem(processItem)
            }
            
            menu.addItem(NSMenuItem.separator())
            let killAllItem = NSMenuItem(
                title: "⚡ Free All Memory (\(result.totalRssFormatted))",
                action: #selector(reapAll),
                keyEquivalent: "r"
            )
            killAllItem.target = self
            menu.addItem(killAllItem)
        }
        
        addBottomActions()
    }
    
    func addBottomActions() {
        menu.addItem(NSMenuItem.separator())
        
        let scanItem = NSMenuItem(title: "Scan Now", action: #selector(manualScan), keyEquivalent: "")
        scanItem.target = self
        menu.addItem(scanItem)
        
        let quitItem = NSMenuItem(title: "Quit GhostDev", action: #selector(quitApp), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)
    }
    
    @objc func restartControlCenterAction() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            let task = Process()
            task.launchPath = "/usr/bin/killall"
            task.arguments = ["ControlCenter"]
            try? task.run()
            task.waitUntilExit()
            
            Thread.sleep(forTimeInterval: 0.8)
            self.runScan()
            
            DispatchQueue.main.async {
                self.sendNotification(
                    title: "GhostDev: Control Center Restarted",
                    message: "macOS Control Center was cleanly refreshed. Memory leak resolved."
                )
            }
        }
    }
    
    @objc func killSingleItem(_ sender: NSMenuItem) {
        guard let item = sender.representedObject as? ZombieItem else { return }
        
        if item.type == "memory-leak" && item.name.contains("Control Center") {
            restartControlCenterAction()
            return
        }
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            let task = Process()
            task.launchPath = "/bin/kill"
            task.arguments = ["-15", "\(item.pid)"]
            try? task.run()
            task.waitUntilExit()
            
            Thread.sleep(forTimeInterval: 1.0)
            self?.runScan()
        }
    }
    
    @objc func reapAll() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            let task = Process()
            let nodePath = self.findNodeExecutable()
            
            if let cliScript = self.findCliScriptPath() {
                if cliScript.hasSuffix(".js") {
                    if nodePath == "/usr/bin/env" {
                        task.launchPath = "/usr/bin/env"
                        task.arguments = ["node", cliScript, "reap"]
                    } else {
                        task.launchPath = nodePath
                        task.arguments = [cliScript, "reap"]
                    }
                } else {
                    task.launchPath = cliScript
                    task.arguments = ["reap"]
                }
            } else {
                task.launchPath = "/usr/bin/env"
                task.arguments = ["ghostdev", "reap"]
            }
            
            try? task.run()
            task.waitUntilExit()
            
            Thread.sleep(forTimeInterval: 1.0)
            self.runScan()
        }
    }
    
    @objc func manualScan() {
        runScan()
    }
    
    @objc func quitApp() {
        NSApplication.shared.terminate(nil)
    }
}

// Entry Point
let app = NSApplication.shared
let delegate = GhostDevMenuDelegate()
app.delegate = delegate
app.run()

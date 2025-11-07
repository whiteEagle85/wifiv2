/**
* Nutze diese Datei für benutzerdefinierte Funktionen und Blöcke.
* Weitere Informationen unter https://makecode.calliope.cc/blocks/custom
*/

// Definiere ein numerisches Enum für das Protokoll
enum Protocol {
    UDP,
    TCP
}

let isWifiConnected = false;
let result = 0

/**
 * Functions for ESP8285 module.
 */
//% weight=10 color=#036fb6 icon="\uf1eb"
namespace UART_WiFi_V2 {

    /**
     * Setup UART Wifi V2 to connect to wifi
     */
    //% group="UART_WiFi_V2"
    //% block="setup Wifi|TX %txPin|RX %rxPin|baudrate %baudrate|ssid = %ssid|password = %passwd"
    //% txPin.defl=SerialPin.C17
    //% rxPin.defl=SerialPin.C16
    //% baudRate.defl=BaudRate.BaudRate115200
    //% ssid.defl="r332"
    //% passwd.defl="123456789"
    export function setupWifi(txPin: SerialPin, rxPin: SerialPin, baudRate: BaudRate, ssid: string, passwd: string) {
        let result = 0

        isWifiConnected = false

        serial.redirect(txPin, rxPin, baudRate)

        sendAtCmd("ATE0")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        if (result !== 1) return

        sendAtCmd("AT+CWMODE=1")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
                if (result !== 1) return

        sendAtCmd(`AT+CWJAP="${ssid}","${passwd}"`)
        
        result = waitAtResponse("WIFI GOT IP", "ERROR", "None", 20000)
        if (result === 1) {
            isWifiConnected = true
        }
    }

    /**
     * Start Connection to UDP or TCP
     */
    //% weight=75
    //% group="UART_WiFi_V2"
    //% block="setup Connection|Protokoll %protocol|Server %ip|Port %port"
    //% protocol.defl=Protocol.UDP
    //% ip.defl="10.254.10.185"
    //% port.defl="64289"
    export function startCon(protocol: Protocol, ip: string, port: string) {
        
        let protoStr = protocolToString(protocol)

        if (!isWifiConnected) return

        sendAtCmd(`AT+CIPSTART="${protoStr}","${ip}",${port}`)       
        result = waitAtResponse("OK", "ERROR", "ALREADY CONNECTED", 2000)
    }

    /**
     * Close Connection to Wifi
     */
    //% group="UART_WiFi_V2"
    //% block="Connection Close"
    export function endCon() {
        sendAtCmd(`AT+CIPCLOSE`)
    }

    /**
    * Send Data via Wifi
    */
    //% weight=100
    //% group="UART_WiFi_V2"
    //% block="Nachricht %message"
    //% message.defl=""
    export function sendData(message: string) {

        if (!isWifiConnected) return

        if (result == 1 || result == 3) {
            sendAtCmd(`AT+CIPSEND=${message.length}`)    
            result = waitAtResponse(">", "ERROR", "SEND FAIL", 3000)

            if (result == 1) {
                serial.writeString(message)
                waitAtResponse("SEND OK", "ERROR", "SEND FAIL", 3000)
            }
        } 
        basic.pause(2000)
    }

   /**
     * Check ReceiveData
    */
    //% group="UART_WiFi_V2"
    export function receive_data() {
        sendAtCmd("AT+CIPRECVDATA?")
        let antwort = waitAtResponse("OK", "ERROR", "", 1000)
        
        if (antwort.includes("+CIPRECVDATA")) {
            let datenStart = antwort.indexOf(":")
            if (datenStart != -1) {
                let daten = antwort.substr(datenStart + 1).trim()
                return daten
            }
        }

        return ""
    }

    /**
     * Check if UART Wifi V2 is connected to Wifi
     */
    //% group="UART_WiFi_V2"
    //% block="Wifi OK?"
    export function wifiOK() {
        return isWifiConnected
    }

    /**
    * Wait AT response from UART Wifi V2"
    */
    //% block="wait AT response|t1 %target1|t2 %target2|t3%target3|with %timeout milliseconds"
    //% group="UART_WiFi_V2"
    //% target1.defl="t1"
    //% target2.defl="t2"
    //% target3.defl="t3"
    //% timeout.defl="1000"
    export function waitAtResponse(target1: string, target2: string, target3: string, timeout: number) {
        let buffer = ""
        let start = input.runningTime()

        while ((input.runningTime() - start) < timeout) {
            buffer += serial.readString()

            if (buffer.includes(target1)) return 1
            if (buffer.includes(target2)) return 2
            if (buffer.includes(target3)) return 3

            basic.pause(100)
        }

        return 0
    }

    /*function sendAtCmd(cmd: string) {
        serial.writeString(cmd + "\u000D\u000A")
    }*/
        function sendAtCmd(cmd: string) {
        serial.writeString(cmd + "\r\n")
    }


    function protocolToString(p: Protocol): string {
        if (p == Protocol.UDP) return "UDP"
        else return "TCP"
    }
}
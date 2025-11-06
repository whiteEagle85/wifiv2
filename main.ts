UART_WiFi_V2.setupWifi(
SerialPin.C17,
SerialPin.C16,
BaudRate.BaudRate115200,
"ZIMBLMNN Gast",
"M1!2013!M4"
)
basic.forever(function () {
    if (UART_WiFi_V2.wifiOK()) {
        basic.showIcon(IconNames.Happy)
        UART_WiFi_V2.sendData(
        Protocol.UDP,
        "192.168.179.4",
        "64289",
        "25"
        )
        basic.pause(500)
        basic.showNumber(UART_WiFi_V2.waitAtResponse(
        "t1",
        "t2",
        "t3",
        1000
        ))
    } else {
        basic.showIcon(IconNames.Sad)
        basic.pause(500)
        basic.showNumber(UART_WiFi_V2.waitAtResponse(
        "t1",
        "t2",
        "t3",
        1000
        ))
    }
    basic.pause(2000)
})

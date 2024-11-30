// URLs
const firebotRootUrl = `http://localhost:7472/`;
const firebotApiRootUrl = `${firebotRootUrl}api/v1`;
const zunderstreamAdminRootUrl = `${firebotRootUrl}integrations/zunderstream`;
const firebotWsUrl = `ws://localhost:7472/`;

// EventEmitter implemetation
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    }

    removeListener(event, listener) {
        if (typeof this.events[event] === 'object') {
            let index = this.events[event].indexOf(listener);

            if (index > -1) {
                this.events[event].splice(index, 1);
            }
        }
    }

    emit(event) {
        console.debug(`zunderstream event ${event}`);
        if (typeof this.events[event] === 'object') {
            let listeners = this.events[event].slice();
            let args = [].slice.call(arguments, 1);

            for (let i = 0; i < listeners.length; i++) {
                listeners[i].apply(this, args);
            }
        }
    }

    once(event, listener) {
        this.on(event, function g() {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    }
}

// WebSocket Events
const zunderstreamEvents = new EventEmitter();

const zunderstreamTitleUpdatedEventName = "zunderstream:stream-title-updated";
const zunderstreamTpirConfigUpdatedEventName = "zunderstream:tpir-config-updated";
const zunderstreamTpirTitleUpdatedEventName = "zunderstream:tpir-title-updated";
const zunderstreamTpirContestantsUpdatedEventName = "zunderstream:tpir-contestants-updated";
const customVariableEventName = "custom-variable";

// Helper functions
async function getFirebotCustomVariable(variableName) {
    let url = `${firebotApiRootUrl}/custom-variables/${variableName}`;

    const response = await fetch(url);

    return JSON.parse(await response.text());
}

async function setFirebotCustomVariable(variableName, value, ttl) {
    let url = `${firebotApiRootUrl}/custom-variables/${variableName}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: value, ttl: ttl })
    });
}

function setElementContents(elementId, contents) {
    document.getElementById(elementId).innerHTML = contents;
}

function setElementText(elementId, contents) {
    document.getElementById(elementId).innerText = contents;
}

function addClassToElement(elementId, className) {
    document.getElementById(elementId).classList.add(className);
}

function removeClassFromElement(elementId, className) {
    document.getElementById(elementId).classList.remove(className);
}

async function getStreamTitle() {
    const url = `${zunderstreamAdminRootUrl}/stream-title`;
    try {
        const response = await fetch(url);

        if (response.ok) {
            return await response.text();
        }
    }
    catch { }

    return undefined;
}

async function getTpirConfig() {
    const url = `${zunderstreamAdminRootUrl}/tpir-config`;
    try {
        const response = await fetch(url);

        if (response.ok) {
            return await response.json();
        }
    }
    catch { }

    return undefined;
}

async function getTpirContestants() {
    const url = `${zunderstreamAdminRootUrl}/tpir-contestants`;
    try {
        const response = await fetch(url);

        if (response.ok) {
            return await response.json();
        }
    }
    catch { }

    return undefined;
}

if (typeof ReconnectingWebSocket != "undefined") {
    var ws = new ReconnectingWebSocket(firebotWsUrl);

    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: "invoke",
            name: "subscribe-events"
        }));
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type !== "event") {
                return;
            }

            const eventName = message.name.toLowerCase();
            if (eventName.startsWith("custom-event:zunderstream:")) {
                zunderstreamEvents.emit(eventName.substring(13), message.data);
            } else if (eventName === "custom-variable:created" || eventName === "custom-variable:updated") {
                zunderstreamEvents.emit(`${customVariableEventName}:${message.data.name}`, message.data.value);
            } else {
                console.debug(`Ignoring Firebot event ${eventName}`);
            }
        } catch (error) {
            console.error(`Error processing WebSocket message: ${error}`);
        }
    };

    ws.onclose = () => {
        console.debug("Firebot WebSocket connection closed");
    };

    ws.onerror = (error) => {
        console.error(`Unable to connect to WebSocket: ${error}`);
    };
}
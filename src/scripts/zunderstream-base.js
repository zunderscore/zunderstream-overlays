function firebotRootUrl() {
    return `http://localhost:7472/`;
}

function firebotApiRootUrl() {
    return firebotRootUrl() + 'api/v1';
}

function zunderstreamAdminRootUrl() {
    return firebotRootUrl() + 'integrations/zunderstream';
}

async function getFirebotCustomVariable(variableName) {
    let url = `${firebotApiRootUrl()}/custom-variables/${variableName}`;

    const response = await fetch(url);

    return JSON.parse(await response.text());
}

async function setFirebotCustomVariable(variableName, value, ttl) {
    let url = `${firebotApiRootUrl()}/custom-variables/${variableName}`;

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
const serverAddress = "http://140.238.170.74:8001";
const gameName = "logical_mazes";


export async function  rowCount() {
    const responseSize = await fetch(serverAddress + "/" + gameName + "/field/size");
    return await responseSize.json();
}

export async function charField() {
    const responseCharField = await fetch(serverAddress + "/" + gameName + "/field");
    return await responseCharField.json();
}

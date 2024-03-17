import * as alt from 'alt-client';
import * as native from 'natives';

const forbiddenMats = [
    1913209870,
    -1595148316,
    510490462,
    909950165,
    -1907520769,
    -1136057692,
    509508168,
    1288448767,
    -786060715,
    -1931024423,
    -1937569590,
    -878560889,
    1619704960,
    1550304810,
    951832588,
    2128369009,
    -356706482,
    1925605558,
    -1885547121,
    -1942898710,
    312396330,
    1635937914,
    -273490167,
    1109728704,
    223086562,
    1584636462,
    -461750719,
    1333033863,
    -1286696947,
    -1833527165,
    581794674,
    -913351839,
    -2041329971,
    -309121453,
    -1915425863,
    1429989756,
    673696729,
    244521486,
    435688960,
    -634481305,
    -1634184340,
];

let startedSpray = false;
let previewInterval: number | null = null;
let particleInterval: number | null = null;
let previewGraffitiTextLabel: alt.TextLabel | null = null;
let graffitiText: string;
let graffitiSize: number;
let hexColor: string;

alt.on('resourceStart', () => {
    alt.Font.register('/client/fonts/aAttackGraffiti.ttf');
});

alt.on('consoleCommand', (commandName: string, ...args: string[]) => {
    if (commandName != 'startspray') return;

    graffitiText = args[0];
    graffitiSize = parseInt(args[1]);
    hexColor = args[2];

    if (graffitiText == null || graffitiSize == null || hexColor == null) return;
    startSpray(graffitiText, graffitiSize, hexColor);
});

alt.on('keyup', (key: alt.KeyCode) => {
    if (key !== 32) return;
    if (!startSpray) return;

    if (previewGraffitiTextLabel != null && previewInterval != null) {
        let savedPos = previewGraffitiTextLabel.pos;
        let savedRot = previewGraffitiTextLabel.rot;

        alt.clearEveryTick(previewInterval);
        previewInterval = null;

        previewGraffitiTextLabel.destroy();
        previewGraffitiTextLabel = null;

        drawGraffiti(graffitiText, graffitiSize, hexColor, savedPos, savedRot);
    };
});

async function drawGraffiti(graffitiText: string, graffitiSize: number, hexColor: string, graffitiCoord: alt.Vector3, graffitiRotation: alt.Vector3) {
    let ptxDict = "scr_recartheft";
    let ptxName = "scr_wheel_burnout";
    let playerHeading = native.getEntityHeading(alt.Player.local);
    let sprayPos = new alt.Vector3(0.052, 0.041, -0.06);
    let sprayRot = new alt.Vector3(33.0, 38.0, 0.0).toRadians();

    let sprayObject = new alt.LocalObject('ng_proc_spraycan01b', alt.Player.local.pos, alt.Player.local.rot, false);
    sprayObject.toggleCollision(false, true);

    sprayObject.attachToEntity(
        alt.Player.local, 
        native.getPedBoneIndex(alt.Player.local, 57005),
        sprayPos,
        sprayRot,
        true,
        false, false
    );

    await alt.Utils.requestAnimDict('anim@amb@business@weed@weed_inspecting_lo_med_hi@');

    native.requestNamedPtfxAsset(ptxDict);
    await alt.Utils.waitFor(() => native.hasNamedPtfxAssetLoaded(ptxDict));

    native.taskPlayAnim(
        alt.Player.local, 
        'anim@amb@business@weed@weed_inspecting_lo_med_hi@', 
        'weed_spraybottle_stand_spraying_01_inspector',
        1,
        1,
        -1,
        5, 
        0,
        false, false, false
    );

    let rgbaColor = hexToRgb(hexColor);
    let alphaValue = 0;

    let sprayingGraffiti = new alt.TextLabel(
        graffitiText, 
        "a Attack Graffiti", 
        graffitiSize, 
        1, 
        graffitiCoord, 
        graffitiRotation,
        new alt.RGBA(rgbaColor.r, rgbaColor.g, rgbaColor.b, alphaValue),
        0, 
        new alt.RGBA(rgbaColor.r, rgbaColor.g, rgbaColor.b, alphaValue),
    );
    
    sprayingGraffiti.faceCamera = false;

    particleInterval = alt.setInterval(async () => {
        let fwdVector = native.getEntityForwardVector(alt.Player.local);
        let ptxCoords = native.getEntityCoords(alt.Player.local, true).add(fwdVector.mul(0.5)).add(0.0, 0.0, -0.5);

        native.useParticleFxAsset(ptxDict);
        native.setParticleFxNonLoopedColour(rgbaColor.r / 255, rgbaColor.g / 255, rgbaColor.b / 255);
        
        native.startNetworkedParticleFxNonLoopedAtCoord(
            ptxName,
            ptxCoords.x,
            ptxCoords.y,
            ptxCoords.z + 2,
            0,
            0,
            playerHeading,
            0.7,
            false, false, false, false
        );

        if (alphaValue === 255) {
            alt.clearInterval(particleInterval);
            particleInterval = null;

            if (sprayObject.valid) {
                sprayObject.destroy();
            };

            native.clearPedTasks(alt.Player.local);

            startedSpray = false;
            drawSpray(graffitiText, graffitiSize, hexColor, graffitiCoord, graffitiRotation);
            return;
        };

        if (!sprayingGraffiti.valid) return;

        sprayingGraffiti.color = new alt.RGBA(rgbaColor.r, rgbaColor.g, rgbaColor.b, alphaValue);
        alphaValue++;
    }, 200);
};

function calculateRotationFromNormal(oldNormal: alt.Vector3) {
    const length = Math.sqrt(oldNormal.x * oldNormal.x + oldNormal.y * oldNormal.y + oldNormal.z * oldNormal.z);
    const newX = oldNormal.x / length;
    const newY = oldNormal.y / length;
    const newZ = oldNormal.z / length;

    let newNormal = new alt.Vector3(newX, newY, newZ);

    const pitchValue = Math.asin(-newNormal.z);
    const rollValue = Math.atan2(newNormal.y, newNormal.x);
    const yawValue = Math.atan2(-newNormal.x, newNormal.y);

    const pitchDeg = (pitchValue * 180 / Math.PI + 360) % 360;
    const rollDeg = (rollValue * 180 / Math.PI + 360) % 360;
    const yawDeg = (yawValue * 180 / Math.PI + 360) % 360;

    return new alt.Vector3(pitchDeg, rollDeg, yawDeg);
};

function getRaycast() {
    let startPosition = native.getFinalRenderedCamCoord();
    let cameraRotation = native.getFinalRenderedCamRot(2);
    let fwdVector = getDirectionFromRotation(cameraRotation);
    let frontOf = new alt.Vector3(
        (startPosition.x + (fwdVector.x * 4)), 
        (startPosition.y + (fwdVector.y * 4)), 
        (startPosition.z + (fwdVector.z * 4))
    );

    let raycastTest = native.startExpensiveSynchronousShapeTestLosProbe(native.getGameplayCamCoord().x, native.getGameplayCamCoord().y, native.getGameplayCamCoord().z, frontOf.x, frontOf.y, frontOf.z, -1, alt.Player.local, 4);
    let getRaycast = native.getShapeTestResultIncludingMaterial(raycastTest);

    return getRaycast;
};

// Use this with streamIn events from Virtual Entities for sync.
function drawSpray(graffitiText: string, graffitiSize: number, hexColor: string, graffitiCoord: alt.Vector3, graffitiRotation: alt.Vector3) {
    let rgbaColor = hexToRgb(hexColor);
    let graffitiTextLabel = new alt.TextLabel(
        graffitiText, 
        "a Attack Graffiti", 
        graffitiSize, 
        1, 
        graffitiCoord, 
        graffitiRotation,
        rgbaColor, 
        0, 
        rgbaColor
    );

    graffitiTextLabel.faceCamera = false;
};

function startSpray(graffitiText: string, graffitiSize: number, hexColor: string) {
    if (startedSpray) {
        return;
    };

    startedSpray = true;

    if (previewInterval != null) {
        alt.clearEveryTick(previewInterval);
        previewInterval = null;
    };

    let [shapeTestHandle, didHit, endCoords, surfaceNormal, materialHash, entityHit] = getRaycast();
    let matForbidden = forbiddenMats.includes(materialHash);
    if (matForbidden) return;

    let rotFromNormal = calculateRotationFromNormal(surfaceNormal);
    let rgbaColor = hexToRgb(hexColor);
    let graffitiRotation = new alt.Vector3(0, 0, rotFromNormal.z).toRadians();

    previewGraffitiTextLabel = new alt.TextLabel(
        graffitiText, 
        "a Attack Graffiti", 
        graffitiSize, 
        1, 
        endCoords, 
        graffitiRotation,
        rgbaColor,
        0, 
        rgbaColor
    );

    previewGraffitiTextLabel.faceCamera = false;

    previewInterval = alt.everyTick(() => {
        let [shapeTestHandle, didHit, endCoords, surfaceNormal, materialHash, entityHit] = getRaycast();
        let rotFromNormal = calculateRotationFromNormal(surfaceNormal);

        let graffitiRotation = new alt.Vector3(0, 0, rotFromNormal.z).toRadians();

        if (!previewGraffitiTextLabel.valid) return;

        previewGraffitiTextLabel.pos = new alt.Vector3(endCoords);
        previewGraffitiTextLabel.rot = graffitiRotation;
    });
};

function hexToRgb(hexCode) {
    let resultColor = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexCode);

    let rColor = parseInt(resultColor[1], 16);
    let gColor = parseInt(resultColor[2], 16);
    let bColor = parseInt(resultColor[3], 16);
    let rgbaResult = new alt.RGBA(rColor, gColor, bColor);

    return resultColor ? rgbaResult : null;
};

function getDirectionFromRotation(rotation) {
    var z = rotation.z * (Math.PI / 180.0);
    var x = rotation.x * (Math.PI / 180.0);
    var num = Math.abs(Math.cos(x));

    return new alt.Vector3(
        (-Math.sin(z) * num),
        (Math.cos(z) * num),
        Math.sin(x)
    );
}
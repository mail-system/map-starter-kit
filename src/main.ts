// /// <reference types="@workadventure/iframe-api-typings" />

// import { bootstrapExtra } from "@workadventure/scripting-api-extra";
// import { ActionMessage } from "@workadventure/iframe-api-typings";

// console.log('Script started successfully');

// /**
//  * Utility function to display the correct door image depending on the state of the door.
//  */
// function displayDoor(state: boolean) {
//     console.log("🔄 Displaying door state:", state);

//     if (state === true) {
//         WA.room.showLayer('opened_door');
//         WA.room.hideLayer('closed_door');
//     } else {

//         WA.room.hideLayer('opened_door');
//         WA.room.showLayer('closed_door');
//     }
// }
// async function getPlayersCountInLayer(layerName: string): Promise<number> {
//     const players = await WA.players.list();
//     const inLayer = [...players].filter(p => (p.state as any).currentLayer === layerName);
//     let count = inLayer.length;
//     console.log("Current player count in layer:", players);

//     // Kiểm tra nếu bản thân đang trong layer
//     const selfInLayer = (WA.player.state as any).currentLayer === layerName;
//     console.log("WA.player.state:", (WA.player.state as any).currentLayer);

//     const selfListed = inLayer.some(p => p.uuid === WA.player.id);

//     if (selfInLayer && !selfListed) {
//         count++;
//     }
//     return count;
// }
// async function updateDoorStepProperties(layerName: string, doorVarName: string) {
//     const count = await getPlayersCountInLayer(layerName);
//     console.log("Current player count in layer:", count);
//     const hasAnyone = count > 0;
//     console.log("Player count in layer:", count);

//     // if (hasAnyone) {
//     //     WA.room.showLayer("blocked_door");
//     //     WA.room.hideLayer("my_door");
//     //     WA.room.hideLayer("door");
//     // } else {
//     //     WA.room.hideLayer("blocked_door");
//     //     WA.room.hideLayer("my_door");
//     //     WA.room.hideLayer("door");
//     // }
// }
// // Waiting for the API to be ready
// WA.onInit().then(async () => {
//     console.log('Scripting API ready');
//     await WA.players.configureTracking({ players: true, movement: false });

//     // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
//     // Most notably for us, it is used to generate the "Configure the room" menu and to handle the "bell".
//     bootstrapExtra().then(() => {
//         console.log('Scripting API Extra ready');
//     }).catch(e => console.error(e));


//     // The doorState variable contains the state of the door.
//     // True: the door is open
//     // False: the door is closed
//     // Upon load, the function bellow is called to initiate the door state.

//     displayDoor(WA.state.doorState as boolean);
//     // Luôn đồng bộ visual khi vào map
//     // Lắng nghe thay đổi state để đồng bộ visual
//     WA.state.onVariableChange('doorState').subscribe((doorState) => {
//         displayDoor(doorState as boolean);
//     });

//     let openCloseMessage: ActionMessage | undefined;
//     let isInZone1 = false;
//     let isInZone2 = false;

//     // Hàm tạo action message cho zone1
//     const createZone1Message = () => {
//         if (!isInZone1) return;
//         openCloseMessage = WA.ui.displayActionMessage({
//             message: "Press 'space' to open/close the door",
//             callback: async () => {
//                 // Kiểm tra nếu đang mở cửa (từ closed -> open) và zone3 có người
//                 const zone3PlayerCount = await getPlayersCountInLayer("door_open_zone3");
//                 console.log("🚪 Zone3 player count:", zone3PlayerCount);

//                 if (zone3PlayerCount > 0) {
//                     console.log("🚫 Không thể mở cửa: Zone3 có người (", zone3PlayerCount, "người)");
//                     // Hiển thị thông báo cảnh báo
//                     WA.ui.displayActionMessage({
//                         message: "❌ Không thể mở cửa: Zone3 đang có người!",
//                         callback: () => { }
//                     });
//                     setTimeout(() => createZone1Message(), 50);
//                     return;
//                 }

//                 const newState = !WA.state.doorState;
//                 WA.state.saveVariable('doorState', newState);
//                 displayDoor(newState);
//                 // Tạo lại message ngay để có thể nhấn tiếp
//                 setTimeout(() => createZone1Message(), 50);
//             }
//         });
//     };

//     // Hàm tạo action message cho zone2
//     const createZone2Message = () => {
//         if (!isInZone2) return;
//         openCloseMessage = WA.ui.displayActionMessage({
//             message: "Press 'space' to open/close the door",
//             callback: () => {
//                 const newState = !WA.state.doorState;
//                 WA.state.saveVariable('doorState', newState);
//                 displayDoor(newState);
//                 // Tạo lại message ngay để có thể nhấn tiếp
//                 setTimeout(() => createZone2Message(), 50);
//             }
//         });
//     };

//     // When someone walks on the doorstep (inside the room), we display a message to explain how to open or close the door
//     WA.room.onEnterLayer('door_open_zone1').subscribe(() => {
//         isInZone1 = true;
//         updateDoorStepProperties("door_open_zone3", "my_door");
//         WA.player.state.saveVariable("currentLayer", "door_open_zone1", { public: true, persist: false });
//         createZone1Message();
//     });

//     // When someone leaves the doorstep (inside the room), we remove the message
//     WA.room.onLeaveLayer('door_open_zone1').subscribe(() => {
//         WA.player.state.saveVariable("currentLayer", undefined, { public: true, persist: false });
//         isInZone1 = false;
//         if (openCloseMessage !== undefined) {
//             openCloseMessage.remove();
//             openCloseMessage = undefined;
//         }
//     });

//     WA.room.onEnterLayer('door_open_zone2').subscribe(() => {
//         WA.player.state.saveVariable("currentLayer", "door_open_zone2", { public: true, persist: false });
//         updateDoorStepProperties("door_open_zone3", "my_door");

//         isInZone2 = true;
//         createZone2Message();
//     });

//     // When someone leaves the doorstep (inside the room), we remove the message
//     WA.room.onLeaveLayer('door_open_zone2').subscribe(() => {
//         WA.player.state.saveVariable("currentLayer", undefined, { public: true, persist: false });
//         isInZone2 = false;
//         if (openCloseMessage !== undefined) {
//             openCloseMessage.remove();
//             openCloseMessage = undefined;
//         }
//     });
//     WA.room.onEnterLayer("door_open_zone3").subscribe(() => {
//         WA.player.state.saveVariable("currentLayer", "door_open_zone3", { public: true, persist: false });
//         //  logPlayersInLayer("door_open_zone3");
//         updateDoorStepProperties("door_open_zone3", "my_door");
//     });

//     WA.room.onLeaveLayer("door_open_zone3").subscribe(() => {
//         WA.player.state.saveVariable("currentLayer", undefined, { public: true, persist: false });
//         // logPlayersInLayer("door_open_zone3");
//         updateDoorStepProperties("door_open_zone3", "my_door");
//     });
// }).catch(e => console.error(e));

// export { };
/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra, getVariables } from "@workadventure/scripting-api-extra";

// Không dùng biến đếm toàn cục, chỉ dùng state từng player
let currentPopup: any;

async function logPlayersInLayer(layerName: string) {
    const players = await WA.players.list();
    const inLayer = [...players].filter(p => (p.state as any).currentLayer === layerName);
    let count = inLayer.length;

    // Kiểm tra nếu bản thân đang trong layer
    const selfInLayer = (WA.player.state as any).currentLayer === layerName;

    const selfListed = inLayer.some(p => p.uuid === WA.player.id);

    if (selfInLayer && !selfListed) {
        count++;
    }
    console.log(`🧍‍♂️ Total players in layer "${layerName}":`, count);
    // Debug: log state của từng player
    for (const p of players) {
        console.log(`Player ${p.name} state:`, p.state);
    }
}
async function getPlayersCountInLayer(layerName: string): Promise<number> {
    const players = await WA.players.list();
    const inLayer = [...players].filter(p => (p.state as any).currentLayer === layerName);
    let count = inLayer.length;
    // Kiểm tra nếu bản thân đang trong layer
    const selfInLayer = (WA.player.state as any).currentLayer === layerName;
    console.log("WA.player.state:", (WA.player.state as any).currentLayer);

    const selfListed = inLayer.some(p => p.uuid === WA.player.id);

    if (selfInLayer && !selfListed) {
        count++;
    }
    return count;
}

// Khi lắng nghe phím:


async function updateDoorStepProperties(layerName: string, doorVarName: string) {
    const count = await getPlayersCountInLayer(layerName);
    console.log("Current player count in layer:", count);
    const hasAnyone = count > 0;
    console.log("Player count in layer:", count);

    // if (hasAnyone) {
    //     WA.room.showLayer("blocked_door");
    //     WA.room.hideLayer("my_door");
    //     WA.room.hideLayer("door");
    // } else {
    //     WA.room.hideLayer("blocked_door");
    //     WA.room.hideLayer("my_door");
    //     WA.room.hideLayer("door");
    // }
}

function closePopup() {
    if (currentPopup) {
        try {
            currentPopup.close();
        } catch (error) {
            console.log("Popup đã được đóng trước đó:", error);
        }
        currentPopup = undefined;
    }
}
// let doorState = "closed"; // Trạng thái cửa: "open" hoặc "closed" - XÓA local state

// Hàm lấy trạng thái cửa từ shared state
function getDoorState(): string {
    return WA.state.doorState as string || "closed";
}

// Hàm set trạng thái cửa vào shared state  
function setDoorState(state: string) {
    WA.state.doorState = state;
}

// Hàm toggle cửa
async function toggleDoor() {
    // Kiểm tra nếu đang ở zone1 và zone3 có người thì không cho mở cửa
    const currentLayer = (WA.player.state as any).currentLayer;
    const currentDoorState = getDoorState();

    if (currentLayer === "door_open_zone1" && currentDoorState === "closed") {
        const zone3PlayerCount = await getPlayersCountInLayer("door_open_zone3");
        console.log("Số người trong Zone3:", zone3PlayerCount);

        if (zone3PlayerCount > 0) {
            console.log("🚫 Không thể mở cửa: Zone3 có người (", zone3PlayerCount, "người)");
            // Hiển thị thông báo tạm thời
            const warningPopup = WA.ui.openPopup("popupRectangle", "❌ Không thể mở cửa: Zone3 đang có người!", []);
            setTimeout(() => {
                if (warningPopup) warningPopup.close();
            }, 2000);
            return;
        }
    }

    if (currentDoorState === "closed") {
        // Mở cửa
        setDoorState("open");
        syncDoorVisual();
        console.log("🚪 Cửa đã mở");
    } else {
        // Đóng cửa
        setDoorState("closed");
        syncDoorVisual();
        console.log("🚪 Cửa đã đóng");
    }
}

// Hàm đồng bộ visual door state với shared state
function syncDoorVisual() {
    const currentDoorState = getDoorState();
    if (currentDoorState === "open") {
        WA.room.showLayer("opened_door");
        WA.room.hideLayer("closed_door");
    } else {
        WA.room.hideLayer("opened_door");
        WA.room.showLayer("closed_door");
    }
}


// Hàm tạo popup cho zone với state hiện tại
function createZonePopup(zoneNumber: number) {
    const currentDoorState = getDoorState();
    const title = zoneNumber === 1 ? `Cửa hiện tại: ${currentDoorState.toUpperCase()}` : `Zone ${zoneNumber} - Cửa: ${currentDoorState.toUpperCase()}`;
    const className = zoneNumber === 1 ? "primary" : "success";
    const cancelClassName = zoneNumber === 1 ? "normal" : "warning";

    currentPopup = WA.ui.openPopup("popupRectangle", title, [
        {
            label: currentDoorState === "closed" ? "🔓 Mở cửa" : "🔒 Đóng cửa",
            className: className,
            callback: async () => {
                // Luôn lấy trạng thái mới nhất khi bấm nút
                await toggleDoor();
                // Sau khi toggle, popup sẽ được cập nhật lại qua updateZonePopups khi state thay đổi
                closePopup();
            }
        },
        {
            label: "❌ Hủy",
            className: cancelClassName,
            callback: () => closePopup()
        }
    ]);
}

// Hàm cập nhật popup khi state thay đổi
function updateZonePopups() {
    const currentLayer = (WA.player.state as any).currentLayer;
    if (currentLayer === "door_open_zone1" || currentLayer === "door_open_zone2") {
        // Đóng popup cũ và tạo popup mới với state mới
        closePopup();
        const zoneNumber = currentLayer === "door_open_zone1" ? 1 : 2;
        createZonePopup(zoneNumber);
    }
}

WA.onInit().then(async () => {
    await WA.players.configureTracking({ players: true, movement: false });

    // Khởi tạo trạng thái cửa nếu chưa có
    if (!WA.state.doorState) {
        setDoorState("closed");
    }

    // Đồng bộ visual với state hiện tại
    syncDoorVisual();

    // Lắng nghe thay đổi state của cửa từ các client khác
    WA.state.onVariableChange('doorState').subscribe((doorState) => {
        console.log("🔄 Door state changed to:", doorState);
        syncDoorVisual();
        updateZonePopups(); // Cập nhật popup khi state thay đổi
    });

    WA.room.area.onEnter('clock').subscribe(() => {
        const t = new Date();
        currentPopup = WA.ui.openPopup("clockPopup", `It's ${t.getHours()}:${t.getMinutes()}`, []);
    });
    WA.room.area.onLeave('clock').subscribe(closePopup);

    WA.room.onEnterLayer("door_open_zone1").subscribe(() => {
        WA.player.state.saveVariable("currentLayer", "door_open_zone1", { public: true, persist: false });
        updateDoorStepProperties("door_open_zone3", "my_door");
        syncDoorVisual();
        closePopup();
        createZonePopup(1);
    });

    WA.room.onLeaveLayer("door_open_zone1").subscribe(() => {
        WA.player.state.saveVariable("currentLayer", undefined, { public: true, persist: false });
        updateDoorStepProperties("door_open_zone3", "my_door");
        syncDoorVisual();
        // closePopup(); // Đóng popup khi rời zone1
    });

    WA.room.onEnterLayer("door_open_zone2").subscribe(() => {
        WA.player.state.saveVariable("currentLayer", "door_open_zone2", { public: true, persist: false });
        updateDoorStepProperties("door_open_zone3", "my_door");
        syncDoorVisual();
        closePopup();
        createZonePopup(2);
    });

    WA.room.onLeaveLayer("door_open_zone2").subscribe(() => {
        //WA.player.state.saveVariable("currentLayer", undefined, { public: true, persist: false });
        updateDoorStepProperties("door_open_zone3", "my_door");
        syncDoorVisual();
        closePopup(); // Đóng popup khi rời zone2
    });

    WA.room.onEnterLayer("door_open_zone3").subscribe(() => {
        WA.player.state.saveVariable("currentLayer", "door_open_zone3", { public: true, persist: false });
        //  logPlayersInLayer("door_open_zone3");
        updateDoorStepProperties("door_open_zone3", "my_door");
        syncDoorVisual();
    });

    WA.room.onLeaveLayer("door_open_zone3").subscribe(() => {
        WA.player.state.saveVariable("currentLayer", undefined, { public: true, persist: false });
        // logPlayersInLayer("door_open_zone3");
        updateDoorStepProperties("door_open_zone3", "my_door");
        syncDoorVisual();
    });
    // WA.room.onEnterLayer("door_open_zone4").subscribe(() => {
    //     helloWorldPopup = WA.ui.openPopup("popupRectangle", 'Hello world!', [{
    //         label: "Close",
    //         className: "primary",
    //         callback: (popup) => {
    //             // // Close the popup when the "Close" button is pressed.
    //             WA.room.showLayer("open");
    //             WA.room.hideLayer("close");
    //             popup.close();
    //         }
    //     }]);


    // });

    bootstrapExtra().then(() => console.log('Extra ready')).catch(console.error);

}).catch(console.error);

export { };

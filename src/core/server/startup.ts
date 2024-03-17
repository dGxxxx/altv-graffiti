import * as alt from 'alt-server';

alt.on('playerConnect', handlePlayerConnect);

function handlePlayerConnect(player: alt.Player) {
    player.model = 'mp_m_freemode_01';
    player.spawn(0, 0, 72, 0);
    player.rot = new alt.Vector3(0, 0, 2.7814)
    player.pos = new alt.Vector3(-1.6437071561813354,
        0.4750996530056,
        71.14990234375)
}

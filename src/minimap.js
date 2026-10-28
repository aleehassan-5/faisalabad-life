// Rotating canvas minimap: roads, traffic dots, player arrow (always points up).
export class Minimap {
  constructor(size = 180, range = 140) {
    this.size = size; this.range = range;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    Object.assign(c.style, { position: 'fixed', right: '16px', bottom: '16px', borderRadius: '50%',
      border: '3px solid #fff', boxShadow: '0 0 8px #000', background: '#3b3a33' });
    document.body.appendChild(c);
    this.ctx = c.getContext('2d');
  }

  draw(player, traffic) {
    const { ctx, size: s, range } = this, k = s / (2 * range), h = player.heading;
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.translate(s / 2, s / 2);
    ctx.rotate(h + Math.PI);                      // heading up
    ctx.translate(-player.pos.x * k, -player.pos.z * k);
    ctx.fillStyle = '#555'; ctx.fillRect(-7 * k, -2000 * k, 14 * k, 4000 * k); // Z road
    ctx.fillRect(-2000 * k, -7 * k, 4000 * k, 14 * k);                       // X road
    ctx.fillStyle = '#e8c34a';
    for (const c of traffic.cars) { const p = traffic.worldPos(c); ctx.fillRect(p.x * k - 2, p.z * k - 2, 4, 4); }
    ctx.restore();
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath(); ctx.moveTo(s / 2, s / 2 - 8); ctx.lineTo(s / 2 - 6, s / 2 + 6); ctx.lineTo(s / 2 + 6, s / 2 + 6); ctx.fill();
  }
}

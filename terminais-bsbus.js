// ==========================================
// TERMINAIS (polígonos + alfinetes) — colar ANTES de "// Inicialização"
// Usa o `map` já existente. Cria o CSS e o interruptor sozinho.
// ==========================================
(function () {
    // ---- CSS ----
    const st = document.createElement('style');
    st.textContent = `
        .terminal-pin-icon { background: transparent; border: none; }
        .terminal-pin { width: 100%; height: 100%; filter: drop-shadow(0 2px 3px rgba(0,0,0,.4)); }
        .terminal-pin svg { width: 100%; height: 100%; overflow: visible; display: block; }
        .popup-terminal .leaflet-popup-content { width: auto !important; min-width: 170px; margin: 10px 16px !important; text-align: left; }
        .t-header { font-weight: 800; font-size: 14px; color: #1e293b; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 4px; }
        .t-body { font-size: 13px; color: #555; }
        .toggle-terminals-container { top: calc(max(10px, env(safe-area-inset-top)) + 46px) !important; }
    `;
    document.head.appendChild(st);

    // ---- Interruptor "Mostrar terminais" (abaixo do de paradas) ----
    const box = document.createElement('div');
    box.className = 'toggle-stops-container toggle-terminals-container';
    box.innerHTML = `
        <span class="toggle-label">Mostrar terminais:</span>
        <label class="switch"><input type="checkbox" id="chk-show-terminals"><span class="slider"></span></label>`;
    document.body.appendChild(box);
    box.addEventListener('click', e => e.stopPropagation());

    // ---- Dados: [nome, código, [[lng,lat], ...]] ----
    const TERMINAIS = [
        ["Rodoviária do Plano Piloto", "001", [[-47.8831481,-15.7925478],[-47.8816502,-15.792997],[-47.882342,-15.7951952],[-47.8831428,-15.7949427],[-47.8838901,-15.7947216]]],
        ["Guará 1", "025", [[-47.9871366,-15.8201075],[-47.9864577,-15.8201464],[-47.9862741,-15.8205057],[-47.9869045,-15.8207081]]],
        ["Guará 2", "026", [[-47.9663066,-15.8398745],[-47.9650615,-15.83973],[-47.9649582,-15.8409551],[-47.9661129,-15.8411447]]],
        ["Núcleo Bandeirante", "039", [[-47.975204,-15.8756672],[-47.9744558,-15.8753611],[-47.974052,-15.876078],[-47.9748154,-15.876452]]],
        ["M Norte", "046", [[-48.11117167288401,-15.79410573188511],[-48.1096609,-15.7951249],[-48.1100705,-15.7956963],[-48.1116722,-15.7947098]]],
        ["Setor 'O'", "047", [[-48.136005,-15.7872979],[-48.1340196,-15.7866702],[-48.1331713,-15.7887514],[-48.1351863,-15.7894637]]],
        ["Taguatinga Norte (Rodoviária)", "051", [[-48.0832835,-15.8353925],[-48.0823964,-15.8352216],[-48.0814924,-15.8350003],[-48.081319,-15.8355228],[-48.0821331,-15.8357673],[-48.0830627,-15.8360695]]],
        ["Taguatinga Sul", "052", [[-48.0381344,-15.8666465],[-48.0375519,-15.8663705],[-48.0369856,-15.8674198],[-48.0375763,-15.8677322],[-48.0379129,-15.8670525]]],
        ["Rodoviária de Brazlândia", "065", [[-48.1943994,-15.6833493],[-48.1939626,-15.6832096],[-48.1935932,-15.6830677],[-48.1930198,-15.6847435],[-48.1938207,-15.684964]]],
        ["Samambaia Sul", "093", [[-48.1303918,-15.90202],[-48.1276736,-15.9011891],[-48.1273333,-15.9020176],[-48.1292024,-15.9026477],[-48.1301426,-15.902928],[-48.1302217,-15.9025866]]],
        ["Riacho Fundo 1", "110", [[-48.0237499,-15.8858706],[-48.0225303,-15.8853952],[-48.0223173,-15.8859302],[-48.0222229,-15.8861598],[-48.0234502,-15.886574]]],
        ["Samambaia Norte", "121", [[-48.1517881,-15.8839878],[-48.1497008,-15.8834174],[-48.1493773,-15.8843819],[-48.1505269,-15.8847265],[-48.151381,-15.8849556]]],
        ["Veredas", "136", [[-48.1991933,-15.6712634],[-48.1987778,-15.6712803],[-48.1990282,-15.6722521],[-48.1997209,-15.6721877]]],
        ["Recanto das Emas", "143", [[-48.1097776,-15.9329819],[-48.1095684,-15.9327471],[-48.1093285,-15.9324797],[-48.1081734,-15.933366],[-48.108371,-15.9336489],[-48.1085665,-15.9339191]]],
        ["QNR", "211", [[-48.1578032,-15.8084975],[-48.1572876,-15.8072049],[-48.1569035,-15.8070681],[-48.1563912,-15.8086994],[-48.1577314,-15.8090607]]],
        ["Estrutural", "248", [[-47.99760316733963,-15.78406743322617],[-47.99724631469647,-15.78406743322617],[-47.99724631469647,-15.784939878090455],[-47.99760316733963,-15.784939878090455]]],
        ["Recanto 600/800", "251", [[-48.0557593,-15.9125319],[-48.05515,-15.9127972],[-48.055661,-15.9138042],[-48.0562927,-15.91344],[-48.056034,-15.9129931]]],
        ["CAUB 2 / QS 18", "262", [[-48.0342384,-15.9490432],[-48.0339412,-15.9488102],[-48.033649,-15.9486045],[-48.0327138,-15.9497073],[-48.0333308,-15.9501509]]],
        ["Asa Norte", "273", [[-47.9086171,-15.735711917746173],[-47.9062977,-15.7350689],[-47.9061308,-15.735539],[-47.9059321,-15.7361553],[-47.9088252,-15.7370318]]],
        ["Sol Nascente/ Pinheiros", "299", [[-48.1434854,-15.8321884],[-48.1424172,-15.831996],[-48.1421445,-15.8321401],[-48.1418945,-15.8322659],[-48.14386593439019,-15.832671670422357],[-48.1436926,-15.8324379]]]
    ];

    const pinIcon = L.divIcon({
        className: 'terminal-pin-icon',
        html: `<div class="terminal-pin"><svg viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="#D32F2F" stroke="#FFFFFF" stroke-width="2"/>
            <text x="15" y="19" fill="#FFFFFF" font-family="Arial, sans-serif" font-weight="bold" font-size="14" text-anchor="middle" dominant-baseline="central">T</text>
        </svg></div>`,
        iconSize: [16, 22],
        iconAnchor: [8, 22],
        popupAnchor: [0, -22]
    });

    // ---- Camada (não intercepta cliques do mapa nos polígonos) ----
    const terminaisLayer = L.layerGroup();

    TERMINAIS.forEach(([nome, codigo, coords]) => {
        const latlngs = coords.map(([lng, lat]) => [lat, lng]);

        L.polygon(latlngs, {
            color: '#000000', weight: 3, fillColor: '#e205ed', fillOpacity: 0.25, interactive: false
        }).addTo(terminaisLayer);

        const center = L.polygon(latlngs).getBounds().getCenter();
        const marker = L.marker(center, { icon: pinIcon, zIndexOffset: 100 });

        // autoClose:false => abrir o popup do terminal não fecha o popup do ônibus selecionado
        marker.bindPopup(
            `<div class="t-header">Terminal ${nome}</div><div class="t-body">Código: ${codigo}</div>`,
            { className: 'popup-terminal', autoClose: false, closeOnClick: false, autoPan: false }
        );
        marker.on('mouseover', function () { this.openPopup(); });
        marker.on('mouseout', function () { this.closePopup(); });
        marker.addTo(terminaisLayer);
    });

    // ---- Liga/desliga + lembra a escolha ----
    const chk = document.getElementById('chk-show-terminals');
    function aplicar() {
        if (chk.checked) terminaisLayer.addTo(map);
        else map.removeLayer(terminaisLayer);
    }
    chk.checked = localStorage.getItem('showTerminals') === 'true';
    chk.addEventListener('change', () => {
        localStorage.setItem('showTerminals', chk.checked);
        aplicar();
    });
    aplicar();
})();

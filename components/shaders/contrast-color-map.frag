precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_colorPalette;
uniform vec2 u_paletteSize;
uniform float u_boxSize;
uniform vec2 u_hoveredColor;
uniform float u_hoverScale;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 grid = floor(st * u_resolution / u_boxSize);
    vec2 invertedGrid = vec2(grid.x, u_paletteSize.y - 1.0 - grid.y);
    
    if (grid.x < u_paletteSize.x && grid.y < u_paletteSize.y) {
        vec2 texCoord = (grid + 0.5) / u_paletteSize;
        vec4 color = texture2D(u_colorPalette, texCoord);
        
        if (invertedGrid == u_hoveredColor) {
            vec2 boxSt = fract(st * u_resolution / u_boxSize);
            vec2 scaledSt = (boxSt - 0.5) * u_hoverScale + 0.5;
            
            if (scaledSt.x >= 0.0 && scaledSt.x <= 1.0 && scaledSt.y >= 0.0 && scaledSt.y <= 1.0) {
                float borderWidth = 0.1;
                if (scaledSt.x < borderWidth || scaledSt.x > 1.0 - borderWidth ||
                    scaledSt.y < borderWidth || scaledSt.y > 1.0 - borderWidth) {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White border
                } else {
                    gl_FragColor = color;
                }
            } else {
                gl_FragColor = vec4(0.5, 0.5, 0.5, 0.5); // Gray for debugging
            }
        } else {
            gl_FragColor = color;
        }
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}

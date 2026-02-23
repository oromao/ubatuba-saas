# Page snapshot

```yaml
- dialog "Unhandled Runtime Error" [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e7]:
          - button "previous" [disabled] [ref=e8]:
            - img "previous" [ref=e9]
          - button "next" [disabled] [ref=e11]:
            - img "next" [ref=e12]
          - generic [ref=e14]: 1 of 1 error
          - generic [ref=e15]:
            - text: Next.js (14.2.5) is outdated
            - link "(learn more)" [ref=e17] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - button "Close" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
      - heading "Unhandled Runtime Error" [level=1] [ref=e23]
      - paragraph [ref=e24]: "Error: {\"requestedAttributes\":{\"alpha\":true,\"stencil\":true,\"depth\":true,\"failIfMajorPerformanceCaveat\":false,\"preserveDrawingBuffer\":false,\"antialias\":false},\"statusMessage\":\"Could not create a WebGL context, VENDOR = 0xffff, DEVICE = 0xffff, GL_VENDOR = Google Inc. (Google), GL_RENDERER = ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver-5.0.0), GL_VERSION = 5.0.0, Sandboxed = no, Optimus = no, AMD switchable = no, Reset notification strategy = 0x8252, ErrorMessage = BindToCurrentSequence failed: .\",\"type\":\"webglcontextcreationerror\",\"message\":\"Failed to initialize WebGL\"}"
    - generic [ref=e25]:
      - heading "Source" [level=2] [ref=e26]
      - generic [ref=e27]:
        - link "src/app/app/maps/page.tsx (843:17) @ eval" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]: src/app/app/maps/page.tsx (843:17) @ eval
          - img [ref=e31]
        - generic [ref=e35]: "841 | if (!mapContainerRef.current || mapRef.current) return; 842 | > 843 | const map = new maplibregl.Map({ | ^ 844 | container: mapContainerRef.current, 845 | style: { 846 | version: 8,"
      - heading "Call Stack" [level=2] [ref=e36]
      - button "Show collapsed frames" [ref=e37] [cursor=pointer]
```
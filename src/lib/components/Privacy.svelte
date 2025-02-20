<label for="privacyModal" class="btn btn-ghost flex gap-2">
  <i class="fa-solid fa-shield-halved text-xl"></i> 安全
</label>

<input type="checkbox" id="privacyModal" class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box flex flex-col gap-4 text-base-content">
    <h1 class="text-3xl font-bold">数据安全</h1>
    <p>
      <span class="text-xl font-extrabold">
        您创建的图表内容永远不会离开您的浏览器。
      </span>
      它只存储在URL和浏览器的本地存储中。
    </p>
    <p>
      Mermaid在线编辑器是一个完全客户端的应用程序，它也可以作为离线<a
        href="https://web.dev/explore/progressive-web-apps"
        class="link"
        target="_blank">
        PWA
      </a>使用。
    </p>
    <p>
      我们唯一的服务器是开源且注重隐私的Plausible Analytics的自托管版本。我们只收集与执行的操作相关的数据，如渲染的图表类型、功能使用次数等。<br /> 我们收集的所有数据都是匿名的，并且
      <a href="https://p.mermaid.live/mermaid.live" class="link" target="_blank">
        可以公开访问。
      </a>
    </p>

    <p>
      额外的服务，如外部PNG/SVG/Kroki链接和"保存到Mermaid Chart"功能将与相应的第三方服务共享您的图表。
    </p>

    <label class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" for="privacyModal">
      X
    </label>
  </div>
</div>

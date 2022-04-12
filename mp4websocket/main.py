from gstreamer import GstContext, GstPipeline, Gst, GstApp
import asyncio
from queue import Queue

import websockets

queue = Queue(maxsize=10000)

def setToToSent(value):
    global queue
    queue.put(value)

async def handler(websocket, path):
    global queue

    with GstContext():
        command = "rtspsrc location=rtsp://localhost:8554/example ! rtph264depay ! h264parse ! mp4mux streamable=1 fragment-duration=100 ! appsink emit-signals=true"

        with GstPipeline(command) as pipeline:
            appsink = pipeline.get_by_cls(GstApp.AppSink).pop(0)

            def on_new_sample(arg):
                sample = appsink.pull_sample()
                buffer = sample.get_buffer()
                (result, mapinfo) = buffer.map(Gst.MapFlags.READ)
                if result:
                    try:
                        setToToSent(mapinfo.data)

                    finally:
                        buffer.unmap(mapinfo)
                return Gst.FlowReturn.OK

            appsink.set_property('emit-signals', True)
            appsink.connect("new-sample", on_new_sample)

            while not pipeline.is_done or queue.qsize() > 0:
                if queue.qsize() > 0:
                    value = queue.get()
                    await websocket.send(value)

start_server = websockets.serve(handler, "localhost", 1234)

asyncio.get_event_loop().run_until_complete(start_server)

asyncio.get_event_loop().run_forever()

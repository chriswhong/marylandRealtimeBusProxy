# marylandRealtimeBusProxy
A proxy API for Maryland's realtime bus tracker.  The /vehicles endpoint grabs realtime location for all buses currently available on the Maryland MTA Bus Tracker and converts them to valid geoJSON.  

##Background
Based on [this earlier project to log, map and analyze data](https://github.com/chriswhong/mtaMarylandBusTracking), this is a simplified version of the data transformation, and does not log anything.  It just grabs data, transforms it, and serves it.  

It is live at [mtabustrack.herokuapp.com](http://mtabustrack.herokuapp.com)

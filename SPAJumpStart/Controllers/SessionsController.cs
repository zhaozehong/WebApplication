using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace CodeCamper.Controllers
{
  public class SessionsController : ApiController
  {
    // GET api/sessions
    public IEnumerable<object> Get()
    {
      var ctx = new CodeCamperDbContext();
      var query = ctx.Sessions.Select(s => new
      {
        Id = s.Id,
        Title = s.Title,
        Code = s.Code,
        SpeakerId = s.SpeakerId,
        SpeakerFirstName = s.Speaker.FirstName,
        SpeakerLastName = s.Speaker.LastName,
        SpeakerImageSource = s.Speaker.ImageSource,
        TrackId = s.TrackId,
        TrackName = s.Track.Name,
        TimeSlotId = s.TimeSlotId,
        TimeSlotStart = s.TimeSlot.Start,
        RoomId = s.RoomId,
        RoomName = s.Room.Name,
        Level = s.Level,
        Tags = s.Tags,
      });
      return query;
    }
  }
}
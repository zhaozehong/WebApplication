using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace CodeCamper.Controllers
{
  public class SpeakersController : ApiController
  {
    // GET api/speakers
    public IEnumerable<object> Get()
    {
      var ctx = new CodeCamperDbContext();
      var query = ctx.Set<Session>().Select(p => p.Speaker).Distinct()
        .Select(s => new
        {
          Id = s.Id,
          FirstName = s.FirstName,
          LastName = s.LastName,
          ImageSource = s.ImageSource,
        });
      return query;
    }
  }
}
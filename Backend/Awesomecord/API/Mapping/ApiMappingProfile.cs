using AutoMapper;
using Application.Users.DTOs;
using API.Contracts;

namespace API.Mapping;

public sealed class ApiMappingProfile : Profile
{
    public ApiMappingProfile()
    {
        CreateMap<UserDto, GetAllDataUserResponseContract>()
            .ForMember(dest => dest.friends,
                opt => opt.MapFrom(src => 
                    src.Friends.Select(f => f.Friend.UserHandle)))
            .ForMember(dest => dest.sentFriendRequests,
                opt => opt.MapFrom(src => 
                    src.SentFriendRequests.Select(r => r.Recipient.UserHandle)))
            .ForMember(dest => dest.receivedFriendRequests,
                opt => opt.MapFrom(src => 
                    src.ReceivedFriendRequests.Select(r => r.Requester.UserHandle)));

        CreateMap<UserDto, GetUserResponseNoSensitiveDataResponse>();
    }    
}

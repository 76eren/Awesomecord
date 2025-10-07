using API.Contracts.User;
using Application.DTOs;
using AutoMapper;

namespace API.Mapping;

public sealed class ApiMappingProfile : Profile
{
    public ApiMappingProfile()
    {
        CreateMap<UserDto, GetAllDataUserResponseContract>()
            .ForMember(dest => dest.friends,
                opt => opt.MapFrom(src =>
                    src.Friends.Select(f => f.Friend.Id)))
            .ForMember(dest => dest.sentFriendRequests,
                opt => opt.MapFrom(src =>
                    src.SentFriendRequests.Select(r => r.Recipient.Id)))
            .ForMember(dest => dest.receivedFriendRequests,
                opt => opt.MapFrom(src =>
                    src.ReceivedFriendRequests.Select(r => r.Requester.Id)));

        CreateMap<UserDto, GetUserResponseNoSensitiveDataResponse>();
    }
}
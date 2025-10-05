using Application.DTOs;
using AutoMapper;
using Domain;

namespace Application.Users.Commands;

public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();
        
        CreateMap<Friendship, FriendshipFlatDto>();
        CreateMap<FriendRequest, FriendRequestFlatDto>();
    }
}
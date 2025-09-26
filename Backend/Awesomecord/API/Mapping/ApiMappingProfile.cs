using AutoMapper;
using Application.Users.DTOs;
using API.Contracts;

namespace API.Mapping;

public sealed class ApiMappingProfile : Profile
{
    public ApiMappingProfile()
    {
        CreateMap<UserDto, GetUserResponseContract>();
    }
}